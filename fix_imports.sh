find app -type f -name "*.ts*" -exec sed -i \
  -e "s|../../../shared/lib/db|@/lib/db|g" \
  -e "s|../../../shared/lib/schema|@/lib/schema|g" \
  -e "s|../../../client/src/lib/db|@/lib/db|g" \
  -e "s|../../../client/src/lib/schema|@/lib/schema|g" \
  -e "s|../../lib/db|@/lib/db|g" \
  -e "s|../../lib/schema|@/lib/schema|g" \
  -e "s|@/lib/db|@/lib/db|g" \
  -e "s|@/lib/schema|@/lib/schema|g" \
  {} +