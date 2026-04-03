# HomePage

个人主页 / 导航页，使用原生 HTML、CSS、JavaScript 实现。

## 当前状态

- 主页主体仍是纯前端页面。
- 剪切板模块现在已经切换为服务端存储。
- 文本记录和文件记录都会保存到运行站点的那台服务器上，方便多端访问同一份最近记录。

## 运行方式

需要 Node.js 18 或更高版本。

```bash
npm start
```

或：

```bash
node server.js
```

默认监听：

```text
http://0.0.0.0:3000
```

本机访问可直接打开：

```text
http://localhost:3000
```

如果你要让其他设备访问，请使用服务器的局域网 IP 或公网域名，例如：

```text
http://192.168.1.10:3000
```

## 剪切板存储说明

- 草稿输入框内容仍会暂存在当前浏览器，避免刷新时丢失正在编辑的内容。
- 真正保存后的剪切板历史会写入服务器磁盘。
- 上传的文件不会放在浏览器 `IndexedDB` 或 `localStorage` 中。
- 只要多台设备访问的是同一个站点地址，就能看到同一份剪切板历史。

默认数据目录：

```text
storage/clipboard/
```

其中：

- `storage/clipboard/history.json`：剪切板历史元数据
- `storage/clipboard/files/`：已保存文件
- `storage/clipboard/uploads/`：上传中的临时文件

## 上传能力

- 支持多文件上传
- 前端显示上传进度
- 服务端按流写入磁盘，避免一次性把大文件全部读入内存
- 上传失败会返回错误信息
- 过期的上传会话会自动清理

## 注意事项

- 不能再直接双击 `index.html` 用 `file://` 打开，否则服务器剪切板不可用。
- 如果你部署在反向代理后面，请确保 `/api/clipboard/*` 请求能正确转发到 `server.js`。
- `storage/` 已加入 `.gitignore`，默认不会提交到仓库。
