#!/bin/bash

# 初始化 husky
npx husky install

# 添加 pre-commit hook（代码检查和格式化）
npx husky add .husky/pre-commit "npm run lint && npm run format"

# 添加 commit-msg hook（提交信息检查）
npx husky add .husky/commit-msg "npx --no-install commitlint --edit \$1"

echo "✅ Husky hooks 设置完成！"
echo "现在提交代码时会自动："
echo "  - 运行 ESLint 检查"
echo "  - 运行 Prettier 格式化"
echo "  - 检查提交信息格式" 