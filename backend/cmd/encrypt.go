package main

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	// 生成 admin123 对应的 bcrypt 哈希值
	hash, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		panic(err)
	}
	fmt.Println("admin123 对应的 bcrypt 哈希值：", string(hash))
}
