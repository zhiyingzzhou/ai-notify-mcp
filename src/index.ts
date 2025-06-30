#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import NodeNotifier from 'node-notifier';
import * as os from 'os';
import * as path from 'path';

// 获取当前工作目录的项目名称
const getCurrentProjectName = (): string => {
  try {
    const workingDir = process.cwd();
    const projectName = path.basename(workingDir);
    return projectName || 'Unknown Project';
  } catch {
    return 'Unknown Project';
  }
};

// 格式化通知标题
const formatNotificationTitle = (
  title: string,
  projectName: string
): string => {
  if (!projectName || projectName === 'Unknown Project') {
    return title;
  }
  return `${title} [${projectName}]`;
};

// 获取通知图标路径
const getNotificationIcon = (): string => {
  // 推荐使用 256x256 像素的 PNG 图标
  // macOS: 建议 128x128px (最小 64x64px，最大 256x256px)
  // Windows: 建议 256x256px (最小 32x32px，最大 512x512px)
  // Linux: 建议 128x128px (最小 32x32px)
  const iconPath = path.join(__dirname, '..', 'assets', 'icon.png');
  return iconPath;
};

// 定义通知选项接口
interface NotificationOptions {
  title?: string;
  message: string;
  sound?: boolean | string;
  wait?: boolean;
  timeout?: number;
  time?: number;
  urgency?: string;
  icon?: string;
  contentImage?: string; // macOS 特有的图片选项
}

// 定义通知服务接口
interface NotificationService {
  notify: (options: NotificationOptions) => Promise<void>;
}

// 创建通知服务
const createNotificationService = (): NotificationService => {
  // 创建 notifier 实例
  const notifier = new NodeNotifier.NotificationCenter();

  return {
    notify: (options: NotificationOptions): Promise<void> => {
      return new Promise((resolve, reject) => {
        try {
          const platform = os.platform();
          const iconPath = getNotificationIcon();

          const finalOptions: NotificationOptions = {
            ...options,
            wait: false,
            timeout: 5,
          };

          // 根据平台配置声音和图标
          if (options.sound) {
            if (platform === 'darwin') {
              finalOptions.sound = 'Ping';
              // 在 macOS 上使用 contentImage 显示图标
              finalOptions.contentImage = iconPath;
            } else if (platform === 'win32') {
              finalOptions.sound = true;
              finalOptions.icon = iconPath;
            } else if (platform === 'linux') {
              finalOptions.urgency = 'normal';
              finalOptions.icon = iconPath;
            }
          }

          // 调用通知
          notifier.notify(finalOptions, (error: Error | null) => {
            if (error) {
              console.error('通知发送失败:', error);
              // 尝试使用备用方案
              try {
                console.log(`[${options.title}] ${options.message}`);
                resolve();
              } catch (fallbackErr) {
                reject(fallbackErr);
              }
            } else {
              resolve();
            }
          });
        } catch (err) {
          console.error('通知服务错误:', err);
          reject(err);
        }
      });
    },
  };
};

// 创建通知服务实例
const notificationService = createNotificationService();

// 创建服务器实例
const server = new Server(
  {
    name: 'ai-notify-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: { listChanged: true },
    },
  }
);

// 注册工具
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'show_completion_notification',
        description: 'Show a system notification when AI completes a response',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Notification title',
              default: 'AI Assistant',
            },
            message: {
              type: 'string',
              description: 'Notification message',
              default: '已完成回答',
            },
            sound: {
              type: 'boolean',
              description: 'Play notification sound',
              default: true,
            },
          },
        },
      },
      {
        name: 'auto_notify_completion',
        description:
          'Automatically show completion notification (call this after providing any response)',
        inputSchema: {
          type: 'object',
          properties: {
            responseLength: {
              type: 'number',
              description: 'Length of the response (optional)',
              default: 0,
            },
          },
        },
      },
    ],
  };
});

// 处理工具调用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const projectName = getCurrentProjectName();
  const iconPath = getNotificationIcon();

  try {
    switch (name) {
      case 'show_completion_notification': {
        const title = (args?.title as string) || 'AI Assistant';
        const message = (args?.message as string) || '已完成回答';
        const sound = (args?.sound as boolean) ?? true;

        await notificationService.notify({
          title: formatNotificationTitle(title, projectName),
          message,
          sound,
          icon: iconPath,
        });

        return {
          content: [
            {
              type: 'text',
              text: `✅ 系统通知已发送: "${message}"`,
            },
          ],
        };
      }

      case 'auto_notify_completion': {
        const responseLength = (args?.responseLength as number) || 0;
        let autoMessage = '已完成回答';

        if (responseLength > 0) {
          if (responseLength > 1000) {
            autoMessage = '已完成详细回答';
          } else if (responseLength > 500) {
            autoMessage = '已完成回答';
          } else {
            autoMessage = '已完成简短回答';
          }
        }

        await notificationService.notify({
          title: formatNotificationTitle('AI Notify', projectName),
          message: autoMessage,
          sound: true,
          icon: iconPath,
        });

        return {
          content: [
            {
              type: 'text',
              text: `🔔 自动通知已发送`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error('工具调用错误:', error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
});

// 启动服务器
const transport = new StdioServerTransport();
server.connect(transport).catch((error) => {
  console.error('服务器连接错误:', error);
});
