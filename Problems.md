### 0304
- Layout宽度问题，不能100%，需要设定宽度为100vw
- docker run -d \
  --name postgres-prod \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \  # 强密码
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=kairis \
  -e POSTGRES_INITDB_ARGS="--encoding=UTF8 --lc-collate=C --lc-ctype=C" \  # 设置字符集
  -e TZ=Asia/Shanghai \  # 设置时区（避免时间错乱）
  -v ./postgres-data:/var/lib/postgresql/data \  # 挂载到主机指定目录（而非数据卷）
  -v ./postgres-conf:/etc/postgresql/postgresql.conf.d \  # 挂载自定义配置文件
  --memory=2g \  # 限制内存使用（2GB）
  --cpus=1 \  # 限制CPU核心数（1核）
  --restart always \  # 总是重启（容器/主机重启都自动启动）
  --log-opt max-size=100m \  # 日志文件最大100MB
  --log-opt max-file=3 \  # 最多保留3个日志文件
  postgres:16