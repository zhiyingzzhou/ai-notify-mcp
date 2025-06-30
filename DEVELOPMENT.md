# 开发指南

## 🛠 开发工具配置

本项目已配置以下开发工具来提高代码质量和开发效率：

### ESLint + Prettier
- **代码检查**：自动检测代码问题和风格问题
- **代码格式化**：统一代码风格，自动格式化

### Jest
- **单元测试**：确保代码质量和功能正确性
- **覆盖率报告**：监控测试覆盖情况

### Commitlint + Husky
- **提交规范**：强制使用约定式提交格式
- **Git Hooks**：在提交前自动检查和格式化代码

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 设置 Git Hooks
```bash
# 运行设置脚本
./scripts/setup-husky.sh

# 或者手动设置
npm run prepare
npx husky add .husky/pre-commit "npm run lint && npm run format"
npx husky add .husky/commit-msg "npx --no-install commitlint --edit \$1"
```

## 📋 可用命令

### 代码检查和格式化
```bash
npm run lint          # 运行 ESLint 检查
npm run lint:fix      # 自动修复 ESLint 问题
npm run format        # 运行 Prettier 格式化
```

### 测试
```bash
npm run test          # 运行所有测试
npm run test:watch    # 监视模式运行测试
npm run test:coverage # 运行测试并生成覆盖率报告
```

### 开发
```bash
npm run dev           # 开发模式（热重载）
npm run build         # 构建项目
npm start             # 启动服务
```

## 📝 提交规范

使用约定式提交格式：

```
<类型>[可选作用域]: <描述>

[可选正文]

[可选脚注]
```

### 支持的类型：
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式化
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `perf`: 性能优化
- `ci`: CI配置
- `build`: 构建系统
- `revert`: 回滚

### 示例：
```bash
git commit -m "feat: 添加新的通知功能"
git commit -m "fix: 修复通知在 Linux 下不显示的问题"
git commit -m "docs: 更新 README 安装说明"
git commit -m "test: 添加通知模块的单元测试"
```

## 🔧 IDE 配置建议

### VS Code
推荐安装以下扩展：
- ESLint
- Prettier - Code formatter
- Jest

### 配置文件 `.vscode/settings.json`：
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.includePackageJsonAutoImports": "on"
}
```

## 🧪 测试指南

### 测试文件位置
- 单元测试：`tests/*.test.ts`
- 集成测试：`tests/integration/*.test.ts`

### 测试示例
```typescript
import { describe, it, expect } from '@jest/globals';

describe('NotificationService', () => {
  it('should send notification successfully', async () => {
    // 测试逻辑
    expect(result).toBe(expected);
  });
});
```

### 覆盖率要求
- 目标覆盖率：≥ 80%
- 关键功能：≥ 90%

## 🚨 故障排除

### ESLint 错误
```bash
# 查看详细错误信息
npm run lint

# 自动修复可修复的问题
npm run lint:fix
```

### Prettier 格式问题
```bash
# 格式化所有文件
npm run format

# 检查格式是否正确
npx prettier --check src/**/*.ts
```

### Jest 测试失败
```bash
# 运行单个测试文件
npm test -- tests/specific.test.ts

# 运行匹配模式的测试
npm test -- --testNamePattern="notification"

# 查看详细输出
npm test -- --verbose
```

### Husky Hooks 不工作
```bash
# 重新安装 husky
rm -rf .husky
npm run prepare
./scripts/setup-husky.sh
``` 