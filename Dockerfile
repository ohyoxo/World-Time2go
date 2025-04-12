FROM node:18-alpine

WORKDIR /app

# 复制package.json和package-lock.json（如果存在）
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 创建必要的目录
RUN mkdir -p ./tmp

# 暴露端口
EXPOSE 3000

# 运行应用
CMD ["npm", "start"]
