# 高精度GPS井盖风险识别系统

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-brightgreen)](https://github.com/Cameras8/high-gps)
[![YOLOv11](https://img.shields.io/badge/YOLOv11-Powered-blue)](https://github.com/ultralytics/ultralytics)

基于YOLOv11的高精度GPS井盖风险识别系统，实现WGS84坐标精确获取（≤20米精度）和在线Excel数据管理。专为城市基础设施安全监测而设计。

![系统截图](![54324721e6002907642e1bec63b9d11](https://github.com/user-attachments/assets/ab5a819e-46a3-4ead-b935-10b67d2fbbc3))

## 🚀 核心功能

### 📍 高精度定位系统
- **超高精度GPS定位**：目标精度控制在20米以内
- **WGS84坐标系统**：提供标准地理坐标格式
- **多次采样优化**：通过连续定位提升精度
- **实时精度监控**：动态显示定位精度和进度
- **多格式坐标输出**：支持十进制度和度分秒格式

### 🔍 井盖风险识别
- **基于YOLOv11**：先进的目标检测算法
- **多状态识别**：完好、破损、丢失、开启、井圈问题、凹陷
- **风险等级评估**：1-10级严重程度分类
- **流量监测**：小、中、大流量状态记录

### 📊 数据管理系统
- **在线Excel表格**：实时创建和编辑数据表格
- **数据持久化**：本地存储和云端同步
- **多格式导出**：支持Excel(.csv)和JSON格式
- **数据导入导出**：完整的数据迁移功能
- **批量操作**：支持批量数据处理

## 🌐 在线演示

访问 [GitHub Pages 演示](https://github.com/Cameras8/high-gps) 体验完整功能

## 🛠️ 技术栈

- **前端框架**: 原生HTML5 + CSS3 + JavaScript (ES6+)
- **定位技术**: HTML5 Geolocation API
- **AI算法**: YOLOv11 目标检测
- **坐标系统**: WGS84 地理坐标系
- **数据存储**: LocalStorage + JSON
- **响应式设计**: CSS Grid + Flexbox
- **无第三方依赖**: 纯原生实现

## 🚀 快速开始

### 方式一：在线使用
直接访问 [在线演示]([https://github.com/Cameras8/high-gps](https://7072-prod-6gpcn2mk7a79169c-1353412410.tcb.qcloud.la/One-clickAll/index.html?sign=a5993fc5039385f8abeda772c5c90765&t=1749719199)) 即可使用

### 方式二：本地部署

1. **克隆仓库**
   ```bash
   git clone https://github.com/your-username/One_clickAll.git
   cd One_clickAll
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动服务**
   ```bash
   npm start
   ```

4. **访问应用**
   打开浏览器访问 `http://localhost:3000`

### 方式三：直接使用
直接在浏览器中打开 `src/index.html` 文件即可使用

## 📖 使用指南

### 基础定位操作
1. 点击"获取精确位置"按钮
2. 允许浏览器获取位置权限
3. 等待系统自动优化定位精度
4. 查看WGS84坐标和精度信息

### 井盖数据录入
1. 获取精确位置后，点击"添加到表格"
2. 在弹出窗口中选择井盖状态和严重程度
3. 设置流量等级（小/中/大）
4. 确认添加到数据表格

### 数据管理
- **保存数据**: 将当前表格数据保存到本地
- **加载数据**: 从本地加载之前保存的数据集
- **导出Excel**: 导出为CSV格式，可在Excel中打开
- **导出JSON**: 导出为JSON格式，便于数据交换

## 🌍 浏览器兼容性

| 浏览器 | 版本要求 | 定位精度 | 功能完整性 |
|--------|----------|----------|------------|
| Chrome | 50+ | 优秀 | 100% |
| Firefox | 45+ | 良好 | 100% |
| Safari | 10+ | 良好 | 95% |
| Edge | 15+ | 优秀 | 100% |
| 移动浏览器 | 现代版本 | 优秀 | 100% |

## 📋 系统要求

### 硬件要求
- 支持GPS/北斗/GLONASS的设备
- 建议使用移动设备以获得最佳定位精度
- 网络连接（用于地图服务和数据同步）

### 软件要求
- 现代浏览器（支持HTML5 Geolocation API）
- 允许位置访问权限
- JavaScript启用

## ⚠️ 使用注意事项

- **定位权限**: 首次使用需要授权浏览器获取位置信息
- **精度影响因素**: 室内环境、天气条件、设备硬件会影响定位精度
- **电量消耗**: 高精度定位会增加设备电量消耗
- **数据安全**: 所有位置数据仅存储在本地，不会上传到服务器
- **网络要求**: 地图服务需要网络连接，离线模式下仅支持坐标获取

## 📁 项目结构

```
HIgh-GPS/
├── src1/                    # 主要源代码目录
│   ├── css/                # 样式文件
│   │   └── styles.css      # 主样式表
│   ├── js/                 # JavaScript文件
│   │   └── app.js          # 核心应用逻辑
│   ├── images/             # 图像资源
│   │   ├── icon.ico        # 应用图标
│   │   └── github-mark.svg # GitHub图标
│   └── index.html          # 主页面
├── package.json            # 项目配置
├── LICENSE                 # MIT许可证
└── README.md              # 项目文档
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 报告问题
- 使用 [Issues](https://github.com/your-username/HIgh-GPS/issues) 报告bug
- 提供详细的复现步骤和环境信息
- 建议新功能和改进

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👥 开发团队

**CLZJ团队** - 专注于城市基础设施智能监测

- 项目主页: [clzh.tech](https://clzh.tech)
- GitHub: [Cameras8](https://github.com/Cameras8)

## 🙏 致谢

- [YOLOv11](https://github.com/ultralytics/ultralytics) - 提供强大的目标检测算法
- [HTML5 Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API) - 提供位置服务支持
- 所有为项目做出贡献的开发者

---

<div align="center">

**如果这个项目对您有帮助，请给我们一个 ⭐**

[🌐 在线演示](https://github.com/Cameras8/high-gps) | [📖 文档](https://github.com/your-username/HIgh-GPS/wiki) | [🐛 报告问题](https://github.com/your-username/HIgh-GPS/issues)

</div>
