document.addEventListener('DOMContentLoaded', function() {
    const locationButton = document.getElementById('getLocation');
    const stopLocationButton = document.getElementById('stopLocation');
    const resultDiv = document.getElementById('result');
    const copyMessage = document.getElementById('copyMessage');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    // 表格相关元素
    const addToTableBtn = document.getElementById('addToTable');
    const exportExcelBtn = document.getElementById('exportExcel');
    const coordsTableBody = document.getElementById('coordsTableBody');
    
    // 数据管理按钮
    const saveDataBtn = document.getElementById('saveData');
    const loadDataBtn = document.getElementById('loadData');
    const exportDataBtn = document.getElementById('exportData');
    const importDataBtn = document.getElementById('importData');
    const importDataFile = document.getElementById('importDataFile');
    
    // 模态框元素
    const saveDataModal = document.getElementById('saveDataModal');
    const loadDataModal = document.getElementById('loadDataModal');
    const manholeCoverModal = document.getElementById('manholeCoverModal');
    const saveDataNameInput = document.getElementById('saveDataName');
    const confirmSaveBtn = document.getElementById('confirmSave');
    const cancelSaveBtn = document.getElementById('cancelSave');
    const savedDataList = document.getElementById('savedDataList');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    
    // 井盖状态和流量模态框元素
    const manholeCoverStatus = document.getElementById('manholeCoverStatus');
    const flowRate = document.getElementById('flowRate');
    const statusLevel = document.getElementById('statusLevel');
    const confirmManholeCover = document.getElementById('confirmManholeCover');
    const cancelManholeCover = document.getElementById('cancelManholeCover');
    
    // 数据存储键名
    const STORAGE_KEY = 'gpsCoordinatesData';
    const DATA_SETS_KEY = 'gpsDataSets';
    const CURRENT_DATA_KEY = 'gpsCurrentData';
    
    let latitude = null;
    let longitude = null;
    let latitudeDMS = null;
    let longitudeDMS = null;
    let watchId = null;
    let bestAccuracy = Infinity;
    let locationUpdateCount = 0;
    const MAX_LOCATION_UPDATES = 10; // 最多尝试10次获取位置
    const TARGET_ACCURACY = 20; // 目标精度20米
    
    // 检查浏览器是否支持地理位置API
    if (!navigator.geolocation) {
        resultDiv.innerHTML = '<p class="error">您的浏览器不支持地理位置功能</p>';
        locationButton.disabled = true;
        return;
    }
    
    // 页面加载时，从localStorage加载数据
    loadCurrentData();
    
    // 十进制度转换为度分秒格式
    function decimalToDMS(decimal, isLatitude) {
        const absolute = Math.abs(decimal);
        const degrees = Math.floor(absolute);
        const minutesNotTruncated = (absolute - degrees) * 60;
        const minutes = Math.floor(minutesNotTruncated);
        const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);
        
        const direction = isLatitude 
            ? (decimal >= 0 ? "N" : "S") 
            : (decimal >= 0 ? "E" : "W");
        
        return `${degrees}° ${minutes}′ ${seconds}″ ${direction}`;
    }
    
    // 获取当前表格数据
    function getTableData() {
        const rows = coordsTableBody.querySelectorAll('tr');
        const tableData = [];
        
        rows.forEach(row => {
            const coverStatus = row.querySelector('td:nth-child(6) textarea')?.value || '';
            const flowRate = row.querySelector('td:nth-child(7) textarea')?.value || '';
            
            tableData.push({
                longitude: row.cells[1].textContent,
                latitude: row.cells[2].textContent,
                accuracy: row.cells[3].textContent,
                timestamp: row.cells[4].textContent,
                coverStatus: coverStatus,
                flowRate: flowRate
            });
        });
        
        return tableData;
    }
    
    // 从localStorage加载当前使用的数据
    function loadCurrentData() {
        try {
            const savedData = localStorage.getItem(CURRENT_DATA_KEY);
            if (savedData) {
                const tableData = JSON.parse(savedData);
                renderTableData(tableData);
            }
        } catch (error) {
            console.error('加载当前数据失败:', error);
        }
    }
    
    // 保存当前数据到localStorage
    function saveCurrentData() {
        try {
            const tableData = getTableData();
            localStorage.setItem(CURRENT_DATA_KEY, JSON.stringify(tableData));
        } catch (error) {
            console.error('保存当前数据失败:', error);
        }
    }
    
    // 获取所有保存的数据集
    function getSavedDataSets() {
        try {
            const savedSets = localStorage.getItem(DATA_SETS_KEY);
            return savedSets ? JSON.parse(savedSets) : {};
        } catch (error) {
            console.error('获取数据集失败:', error);
            return {};
        }
    }
    
    // 保存数据集
    function saveDataSet(name) {
        try {
            const tableData = getTableData();
            if (tableData.length === 0) {
                alert('表格中没有数据，无法保存');
                return false;
            }
            
            // 获取现有数据集
            const dataSets = getSavedDataSets();
            
            // 添加新数据集
            dataSets[name] = {
                data: tableData,
                timestamp: new Date().toISOString(),
                recordCount: tableData.length
            };
            
            // 保存回localStorage
            localStorage.setItem(DATA_SETS_KEY, JSON.stringify(dataSets));
            
            // 更新当前数据
            saveCurrentData();
            
            return true;
        } catch (error) {
            console.error('保存数据集失败:', error);
            alert('保存数据集失败: ' + error.message);
            return false;
        }
    }
    
    // 加载数据集
    function loadDataSet(name) {
        try {
            const dataSets = getSavedDataSets();
            if (!dataSets[name]) {
                alert(`找不到名为"${name}"的数据集`);
                return false;
            }
            
            const tableData = dataSets[name].data;
            renderTableData(tableData);
            
            // 更新当前数据
            saveCurrentData();
            
            return true;
        } catch (error) {
            console.error('加载数据集失败:', error);
            alert('加载数据集失败: ' + error.message);
            return false;
        }
    }
    
    // 删除数据集
    function deleteDataSet(name) {
        try {
            const dataSets = getSavedDataSets();
            if (!dataSets[name]) {
                return false;
            }
            
            delete dataSets[name];
            localStorage.setItem(DATA_SETS_KEY, JSON.stringify(dataSets));
            
            return true;
        } catch (error) {
            console.error('删除数据集失败:', error);
            alert('删除数据集失败: ' + error.message);
            return false;
        }
    }
    
    // 更新已保存数据集列表显示
    function updateSavedDataList() {
        savedDataList.innerHTML = '';
        
        const dataSets = getSavedDataSets();
        const dataSetNames = Object.keys(dataSets);
        
        if (dataSetNames.length === 0) {
            savedDataList.innerHTML = '<div class="no-data-message">没有已保存的数据集</div>';
            return;
        }
        
        // 按时间倒序排列
        dataSetNames.sort((a, b) => {
            return new Date(dataSets[b].timestamp) - new Date(dataSets[a].timestamp);
        });
        
        dataSetNames.forEach(name => {
            const dataSet = dataSets[name];
            const dataItem = document.createElement('div');
            dataItem.className = 'saved-data-item';
            
            const date = new Date(dataSet.timestamp);
            const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            
            dataItem.innerHTML = `
                <div class="saved-data-info">
                    <div class="saved-data-name">${name}</div>
                    <div class="saved-data-meta">
                        ${dataSet.recordCount}条记录 | 保存于${formattedDate}
                    </div>
                </div>
                <div class="saved-data-delete">&times;</div>
            `;
            
            // 点击数据集名称加载数据
            dataItem.querySelector('.saved-data-info').addEventListener('click', function() {
                if (loadDataSet(name)) {
                    loadDataModal.style.display = 'none';
                    copyMessage.textContent = `已加载数据集"${name}"`;
                    copyMessage.classList.add('show');
                    setTimeout(() => {
                        copyMessage.classList.remove('show');
                        copyMessage.textContent = '坐标已复制到剪贴板';
                    }, 2000);
                }
            });
            
            // 点击删除按钮删除数据集
            dataItem.querySelector('.saved-data-delete').addEventListener('click', function(e) {
                e.stopPropagation();
                if (confirm(`确定要删除数据集"${name}"吗？此操作不可撤销。`)) {
                    if (deleteDataSet(name)) {
                        updateSavedDataList();
                        copyMessage.textContent = `已删除数据集"${name}"`;
                        copyMessage.classList.add('show');
                        setTimeout(() => {
                            copyMessage.classList.remove('show');
                            copyMessage.textContent = '坐标已复制到剪贴板';
                        }, 2000);
                    }
                }
            });
            
            savedDataList.appendChild(dataItem);
        });
    }
    
    // 根据数据渲染表格
    function renderTableData(tableData) {
        // 清空当前表格
        coordsTableBody.innerHTML = '';
        
        // 添加保存的行
        tableData.forEach((rowData, index) => {
            const newRow = document.createElement('tr');
            
            newRow.innerHTML = `
                <td>${index + 1}</td>
                <td>${rowData.longitude}</td>
                <td>${rowData.latitude}</td>
                <td>${rowData.accuracy}</td>
                <td>${rowData.timestamp}</td>
                <td><textarea class="editable-cell" placeholder="点击输入井盖状态" rows="2">${rowData.coverStatus || ''}</textarea></td>
                <td><textarea class="editable-cell" placeholder="点击输入流量" rows="2">${rowData.flowRate || ''}</textarea></td>
                <td><button class="delete-row">删除</button></td>
            `;
            
            // 为输入框添加变更事件
            const coverStatusInput = newRow.querySelector('td:nth-child(6) textarea');
            const flowRateInput = newRow.querySelector('td:nth-child(7) textarea');
            
            coverStatusInput.addEventListener('change', saveCurrentData);
            flowRateInput.addEventListener('change', saveCurrentData);
            
            // 添加删除按钮的事件监听器
            const deleteBtn = newRow.querySelector('.delete-row');
            deleteBtn.addEventListener('click', function() {
                newRow.remove();
                // 更新所有行的序号
                updateRowNumbers();
                // 保存更新后的表格数据
                saveCurrentData();
            });
            
            coordsTableBody.appendChild(newRow);
        });
        
        // 显示加载成功消息
        if(tableData.length > 0) {
            copyMessage.textContent = `已加载${tableData.length}条数据记录`;
            copyMessage.classList.add('show');
            setTimeout(() => {
                copyMessage.classList.remove('show');
                copyMessage.textContent = '坐标已复制到剪贴板';
            }, 2000);
        }
    }
    
    // 复制文本到剪贴板
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            copyMessage.classList.add('show');
            setTimeout(() => {
                copyMessage.classList.remove('show');
            }, 2000);
        } catch (err) {
            console.error('复制失败:', err);
            alert('复制失败，请手动复制坐标');
        }
        
        document.body.removeChild(textarea);
    }
    
    // 获取精度指示颜色
    function getAccuracyClass(accuracy) {
        if (accuracy <= TARGET_ACCURACY) {
            return 'accuracy-high';
        } else if (accuracy <= 50) {
            return 'accuracy-medium';
        } else {
            return 'accuracy-low';
        }
    }
    
    // 获取精度文本描述
    function getAccuracyDescription(accuracy) {
        if (accuracy <= TARGET_ACCURACY) {
            return '高精度';
        } else if (accuracy <= 50) {
            return '中等精度';
        } else {
            return '低精度';
        }
    }
    
    // 更新位置信息显示
    function updateLocationDisplay(position) {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        latitudeDMS = decimalToDMS(latitude, true);
        longitudeDMS = decimalToDMS(longitude, false);
        const accuracy = position.coords.accuracy;
        const accuracyClass = getAccuracyClass(accuracy);
        const accuracyDesc = getAccuracyDescription(accuracy);
        
        let html = `
            <p>获取成功！您当前的位置是：</p>
            <div class="format-title">十进制度格式</div>
            <div class="coordinate-display">
                <span class="coordinate-label">经度:</span> 
                <span class="coordinates">${longitude}</span>
            </div>
            <div class="coordinate-display">
                <span class="coordinate-label">纬度:</span> 
                <span class="coordinates">${latitude}</span>
            </div>
            
            <div class="format-title">度分秒格式</div>
            <div class="coordinate-display">
                <span class="coordinate-label">经度:</span> 
                <span class="coordinates">${longitudeDMS}</span>
            </div>
            <div class="coordinate-display">
                <span class="coordinate-label">纬度:</span> 
                <span class="coordinates">${latitudeDMS}</span>
            </div>
            
            <div class="format-title">其他信息</div>
            <div class="coordinate-display">
                <span class="coordinate-label">精确度:</span> 
                <span class="coordinates">
                    <span id="accuracyIndicator" class="${accuracyClass}"></span>
                    ${accuracy.toFixed(2)} 米 (${accuracyDesc})
                </span>
            </div>
        `;
        
        // 如果有高度信息
        if (position.coords.altitude) {
            html += `
                <div class="coordinate-display">
                    <span class="coordinate-label">海拔:</span> 
                    <span class="coordinates">${position.coords.altitude.toFixed(2)} 米</span>
                </div>
            `;
        }
        
        // 如果有前进方向
        if (position.coords.heading) {
            html += `
                <div class="coordinate-display">
                    <span class="coordinate-label">方向:</span> 
                    <span class="coordinates">${position.coords.heading.toFixed(2)}°</span>
                </div>
            `;
        }
        
        // 如果有速度信息
        if (position.coords.speed) {
            html += `
                <div class="coordinate-display">
                    <span class="coordinate-label">速度:</span> 
                    <span class="coordinates">${position.coords.speed.toFixed(2)} 米/秒</span>
                </div>
            `;
        }
        
        html += `<p>定位时间: ${new Date(position.timestamp).toLocaleString()}</p>`;
        
        // 添加精度提示
        if (accuracy > TARGET_ACCURACY) {
            html += `<p class="warning">当前位置精度为${accuracy.toFixed(2)}米，尚未达到目标精度(${TARGET_ACCURACY}米)。正在继续提高精度...</p>`;
        }
        
        resultDiv.innerHTML = html;
        
        // 启用"添加到表格"按钮
        addToTableBtn.disabled = false;
    }
    
    // 打开井盖状态和流量模态框
    function openManholeCoverModal() {
        // 获取当前表格行数，作为新行的序号
        const rowCount = coordsTableBody.rows.length;
        const currentRowNumber = rowCount + 1;
        
        // 显示当前编号
        document.getElementById('currentRowNumber').textContent = currentRowNumber;
        
        // 重置模态框输入内容
        manholeCoverStatus.value = "完好";
        statusLevel.value = "5";
        flowRate.value = "中";
        
        // 显示模态框
        manholeCoverModal.style.display = 'block';
    }
    
    // 连续获取位置以提高精度
    function watchPosition() {
        bestAccuracy = Infinity;
        locationUpdateCount = 0;
        
        // 显示进度条
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        progressText.textContent = '正在提高定位精度...';
        
        // 显示停止按钮
        stopLocationButton.style.display = 'inline-block';
        locationButton.style.display = 'none';
        
        watchId = navigator.geolocation.watchPosition(
            // 成功回调
            function(position) {
                locationUpdateCount++;
                const currentAccuracy = position.coords.accuracy;
                
                // 更新进度条
                const progress = Math.min((locationUpdateCount / MAX_LOCATION_UPDATES) * 100, 100);
                progressBar.style.width = `${progress}%`;
                
                // 如果获取到更精确的位置
                if (currentAccuracy < bestAccuracy) {
                    bestAccuracy = currentAccuracy;
                    updateLocationDisplay(position);
                    progressText.textContent = `定位精度：${currentAccuracy.toFixed(2)}米，正在继续提高精度...`;
                }
                
                // 如果达到目标精度或者达到最大尝试次数
                if (currentAccuracy <= TARGET_ACCURACY || locationUpdateCount >= MAX_LOCATION_UPDATES) {
                    // 停止监视
                    navigator.geolocation.clearWatch(watchId);
                    watchId = null;
                    
                    // 隐藏进度条和停止按钮
                    progressContainer.style.display = 'none';
                    stopLocationButton.style.display = 'none';
                    locationButton.style.display = 'inline-block';
                    
                    if (currentAccuracy <= TARGET_ACCURACY) {
                        progressText.textContent = `已达到目标精度：${currentAccuracy.toFixed(2)}米`;
                    } else {
                        progressText.textContent = `已获取最佳精度：${bestAccuracy.toFixed(2)}米`;
                    }
                }
            },
            // 错误回调
            function(error) {
                let errorMessage = '';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = '用户拒绝了位置请求';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = '位置信息不可用';
                        break;
                    case error.TIMEOUT:
                        errorMessage = '获取位置请求超时';
                        break;
                    case error.UNKNOWN_ERROR:
                        errorMessage = '发生未知错误';
                        break;
                }
                resultDiv.innerHTML = `<p class="error">错误: ${errorMessage}</p>`;
                
                // 隐藏进度条和停止按钮
                progressContainer.style.display = 'none';
                stopLocationButton.style.display = 'none';
                locationButton.style.display = 'inline-block';
                
                // 清除监视
                if (watchId !== null) {
                    navigator.geolocation.clearWatch(watchId);
                    watchId = null;
                }
            },
            // 选项 - 使用最高精度设置
            {
                enableHighAccuracy: true, // 启用最高精度
                timeout: 30000,           // 增加超时时间到30秒
                maximumAge: 0             // 不使用缓存的位置
            }
        );
    }
    
    // 添加位置到表格
    function addToTable() {
        if (latitude === null || longitude === null) {
            return;
        }
        
        const now = new Date();
        const rowCount = coordsTableBody.rows.length;
        
        // 创建新行
        const newRow = document.createElement('tr');
        
        // 获取井盖状态和流量值
        const coverStatusValue = manholeCoverStatus.value || "完好";
        const statusLevelValue = statusLevel.value || "5";
        const flowRateValue = flowRate.value || "中";
        
        // 组合井盖状态和严重程度
        const combinedStatus = `${coverStatusValue} (${statusLevelValue}/10)`;
        
        // 添加单元格：序号、经度、纬度、精度、时间、井盖状态、流量、操作
        newRow.innerHTML = `
            <td>${rowCount + 1}</td>
            <td>${longitude}</td>
            <td>${latitude}</td>
            <td>${bestAccuracy.toFixed(2)}</td>
            <td>${now.toLocaleString()}</td>
            <td><textarea class="editable-cell" placeholder="点击输入井盖状态" rows="2">${combinedStatus}</textarea></td>
            <td><textarea class="editable-cell" placeholder="点击输入流量" rows="2">${flowRateValue}</textarea></td>
            <td><button class="delete-row">删除</button></td>
        `;
        
        // 为输入框添加变更事件
        const coverStatusInput = newRow.querySelector('td:nth-child(6) textarea');
        const flowRateInput = newRow.querySelector('td:nth-child(7) textarea');
        
        coverStatusInput.addEventListener('change', saveCurrentData);
        flowRateInput.addEventListener('change', saveCurrentData);
        
        // 添加删除按钮的事件监听器
        const deleteBtn = newRow.querySelector('.delete-row');
        deleteBtn.addEventListener('click', function() {
            newRow.remove();
            // 更新所有行的序号
            updateRowNumbers();
            // 保存更新后的表格数据
            saveCurrentData();
        });
        
        // 将新行添加到表格
        coordsTableBody.appendChild(newRow);
        
        // 保存表格数据
        saveCurrentData();
        
        // 关闭模态框
        manholeCoverModal.style.display = 'none';
        
        // 显示提示
        copyMessage.textContent = '坐标已添加到表格';
        copyMessage.classList.add('show');
        setTimeout(() => {
            copyMessage.classList.remove('show');
            copyMessage.textContent = '坐标已复制到剪贴板';
        }, 2000);
    }
    
    // 更新表格行的序号
    function updateRowNumbers() {
        const rows = coordsTableBody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            row.cells[0].textContent = index + 1;
        });
    }
    
    // 导出Excel文件
    function exportToExcel() {
        const rows = coordsTableBody.querySelectorAll('tr');
        if (rows.length === 0) {
            alert('表格中没有数据，无法导出');
            return;
        }
        
        // 创建工作表数据
        let csvContent = '序号,经度,纬度,精度(米),时间,井盖状态,流量\n';
        
        rows.forEach(row => {
            // 获取井盖状态和流量的输入值
            const coverStatus = row.cells[5].querySelector('textarea') ? 
                row.cells[5].querySelector('textarea').value : '';
            const flowRate = row.cells[6].querySelector('textarea') ? 
                row.cells[6].querySelector('textarea').value : '';
            
            const rowData = [
                row.cells[0].textContent,
                row.cells[1].textContent,
                row.cells[2].textContent,
                row.cells[3].textContent,
                row.cells[4].textContent,
                coverStatus.replace(/,/g, '，'),  // 替换逗号，避免CSV格式问题
                flowRate.replace(/,/g, '，')      // 替换逗号，避免CSV格式问题
            ];
            csvContent += rowData.join(',') + '\n';
        });
        
        // 创建Blob对象，准备下载
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        // 创建链接并触发下载
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `GPS坐标数据_${new Date().toLocaleString().replace(/[/:]/g, '-')}.csv`);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // 导出数据到文件
    function exportDataToFile() {
        try {
            const tableData = getTableData();
            
            if(tableData.length === 0) {
                alert('表格中没有数据，无法导出');
                return;
            }
            
            // 弹出保存对话框
            saveDataModal.style.display = 'block';
            saveDataNameInput.value = `GPS数据_${new Date().toLocaleString().replace(/[/:]/g, '-')}`;
            saveDataNameInput.focus();
            
            // 为确认按钮添加一次性事件监听器
            const exportHandler = function() {
                const name = saveDataNameInput.value.trim();
                if (!name) {
                    alert('请输入数据集名称');
                    return;
                }
                
                // 创建用于下载的JSON数据
                const dataStr = JSON.stringify({
                    name: name,
                    timestamp: new Date().toISOString(),
                    recordCount: tableData.length,
                    data: tableData
                }, null, 2);
                
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                // 创建链接并触发下载
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', `${name.replace(/[\\/:*?"<>|]/g, '_')}.json`);
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // 关闭模态框
                saveDataModal.style.display = 'none';
                
                // 显示导出成功消息
                copyMessage.textContent = '数据已导出到文件';
                copyMessage.classList.add('show');
                setTimeout(() => {
                    copyMessage.classList.remove('show');
                    copyMessage.textContent = '坐标已复制到剪贴板';
                }, 2000);
                
                // 移除事件监听器
                confirmSaveBtn.removeEventListener('click', exportHandler);
            };
            
            confirmSaveBtn.addEventListener('click', exportHandler);
            
        } catch (error) {
            console.error('导出数据失败:', error);
            alert('导出数据失败: ' + error.message);
        }
    }
    
    // 从文件导入数据
    function importDataFromFile(file) {
        try {
            if(!file) {
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    let importedData = JSON.parse(e.target.result);
                    
                    // 兼容旧版本导出的数据格式
                    const tableData = importedData.data || importedData;
                    
                    if(!Array.isArray(tableData)) {
                        throw new Error('导入的数据格式不正确');
                    }
                    
                    // 渲染导入的数据
                    renderTableData(tableData);
                    
                    // 保存当前数据
                    saveCurrentData();
                    
                    // 如果有数据集名称，也保存为命名数据集
                    if (importedData.name) {
                        saveDataSet(importedData.name);
                    }
                    
                } catch (parseError) {
                    console.error('解析导入数据失败:', parseError);
                    alert('解析导入数据失败: ' + parseError.message);
                }
            };
            
            reader.onerror = function() {
                alert('读取文件时出错');
            };
            
            reader.readAsText(file);
        } catch (error) {
            console.error('导入数据失败:', error);
            alert('导入数据失败: ' + error.message);
        }
    }
    
    // 打开保存模态框
    function openSaveModal() {
        const tableData = getTableData();
        if (tableData.length === 0) {
            alert('表格中没有数据，无法保存');
            return;
        }
        
        saveDataModal.style.display = 'block';
        saveDataNameInput.value = `GPS数据_${new Date().toLocaleString().replace(/[/:]/g, '-')}`;
        saveDataNameInput.focus();
    }
    
    // 打开加载模态框
    function openLoadModal() {
        updateSavedDataList();
        loadDataModal.style.display = 'block';
    }
    
    // 关闭模态框
    function closeModals() {
        saveDataModal.style.display = 'none';
        loadDataModal.style.display = 'none';
        manholeCoverModal.style.display = 'none';
    }
    
    // 模态框点击外部关闭
    window.addEventListener('click', function(event) {
        if (event.target === saveDataModal) {
            saveDataModal.style.display = 'none';
        }
        if (event.target === loadDataModal) {
            loadDataModal.style.display = 'none';
        }
        if (event.target === manholeCoverModal) {
            manholeCoverModal.style.display = 'none';
        }
    });
    
    // 按钮事件监听器
    
    // 获取位置按钮点击事件
    locationButton.addEventListener('click', function() {
        // 显示加载中的状态
        resultDiv.innerHTML = '<p>正在获取精确位置信息 <span class="loading"></span></p>';
        
        // 开始位置监视
        watchPosition();
    });
    
    // 停止位置获取按钮点击事件
    stopLocationButton.addEventListener('click', function() {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }
        
        // 隐藏进度条和停止按钮
        progressContainer.style.display = 'none';
        stopLocationButton.style.display = 'none';
        locationButton.style.display = 'inline-block';
        
        progressText.textContent = '定位已停止，已获取最佳精度：' + 
            (bestAccuracy !== Infinity ? bestAccuracy.toFixed(2) + '米' : '无法获取');
    });
    
    // 井盖状态和流量确认按钮
    confirmManholeCover.addEventListener('click', addToTable);
    
    // 井盖状态和流量取消按钮
    cancelManholeCover.addEventListener('click', function() {
        manholeCoverModal.style.display = 'none';
    });
    
    // 添加到表格按钮 - 现在直接打开模态框
    addToTableBtn.addEventListener('click', openManholeCoverModal);
    
    // 导出Excel按钮
    exportExcelBtn.addEventListener('click', exportToExcel);
    
    // 保存数据按钮
    saveDataBtn.addEventListener('click', openSaveModal);
    
    // 加载数据按钮
    loadDataBtn.addEventListener('click', openLoadModal);
    
    // 导出数据文件按钮
    exportDataBtn.addEventListener('click', exportDataToFile);
    
    // 导入数据文件按钮
    importDataBtn.addEventListener('click', function() {
        importDataFile.click();
    });
    
    // 导入文件变更事件
    importDataFile.addEventListener('change', function(e) {
        if(this.files.length > 0) {
            if(confirm('确定要导入数据吗？当前未保存的修改将丢失。')) {
                importDataFromFile(this.files[0]);
            }
            // 清空文件输入，确保可以重复选择同一文件
            this.value = '';
        }
    });
    
    // 确认保存按钮事件
    confirmSaveBtn.addEventListener('click', function() {
        const name = saveDataNameInput.value.trim();
        if (!name) {
            alert('请输入数据集名称');
            return;
        }
        
        if (saveDataSet(name)) {
            saveDataModal.style.display = 'none';
            copyMessage.textContent = `数据集"${name}"已保存`;
            copyMessage.classList.add('show');
            setTimeout(() => {
                copyMessage.classList.remove('show');
                copyMessage.textContent = '坐标已复制到剪贴板';
            }, 2000);
        }
    });
    
    // 取消保存按钮事件
    cancelSaveBtn.addEventListener('click', function() {
        saveDataModal.style.display = 'none';
    });
    
    // 关闭模态框按钮事件
    closeModalBtns.forEach(function(btn) {
        btn.addEventListener('click', closeModals);
    });
    
    // 保存数据名称输入框回车事件
    saveDataNameInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            confirmSaveBtn.click();
        }
    });

    // 滑到底部按钮功能
    const scrollToBottomBtn = document.getElementById('scrollToBottom');
    if (scrollToBottomBtn) {
        scrollToBottomBtn.addEventListener('click', function() {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        });
    }
    
    // 滑到顶部按钮功能
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // 浮动操作按钮功能
    const fabMain = document.getElementById('fabMain');
    const fabOptions = document.querySelector('.fab-options');
    const fabGetLocation = document.getElementById('fabGetLocation');
    const fabAddToTable = document.getElementById('fabAddToTable');
    const fabExportData = document.getElementById('fabExportData');
    
    // 展开/收起浮动操作按钮
    if (fabMain) {
        fabMain.addEventListener('click', function() {
            fabMain.classList.toggle('active');
            if (fabOptions.style.display === 'flex') {
                fabOptions.style.display = 'none';
                fabMain.innerHTML = '<i class="fas fa-plus"></i>';
            } else {
                fabOptions.style.display = 'flex';
                fabMain.innerHTML = '<i class="fas fa-times"></i>';
            }
        });
    }
    
    // 浮动按钮 - 获取位置
    if (fabGetLocation) {
        fabGetLocation.addEventListener('click', function() {
            locationButton.click();
            // 收起浮动菜单
            fabOptions.style.display = 'none';
            fabMain.innerHTML = '<i class="fas fa-plus"></i>';
        });
    }
    
    // 浮动按钮 - 添加到表格
    if (fabAddToTable) {
        fabAddToTable.addEventListener('click', function() {
            if (!addToTableBtn.disabled) {
                openManholeCoverModal();
                // 收起浮动菜单
                fabOptions.style.display = 'none';
                fabMain.innerHTML = '<i class="fas fa-plus"></i>';
            }
        });
    }
    
    // 浮动按钮 - 导出数据
    if (fabExportData) {
        fabExportData.addEventListener('click', function() {
            exportExcelBtn.click();
            // 收起浮动菜单
            fabOptions.style.display = 'none';
            fabMain.innerHTML = '<i class="fas fa-plus"></i>';
        });
    }
}); 