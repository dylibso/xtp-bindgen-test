package main

import (
	"fmt"

	"github.com/extism/go-pdk"
)

//go:export logMessage
func logMessage(msgPtr uint64) uint64 {
	msgMem := pdk.FindMemory(msgPtr)
	msg := string(msgMem.ReadBytes())

	fmt.Println(msg)

	valMem := pdk.AllocateString("true")
	return valMem.Offset()
}

//go:export databaseRead
func databaseRead(keyPtr uint64) uint64 {
	keyMem := pdk.FindMemory(keyPtr)
	key := string(keyMem.ReadBytes())

	fmt.Println("databaseRead at key: " + key)

	valMem := pdk.AllocateBytes([]byte("some bytes"))
	return valMem.Offset()
}

//go:export databaseWrite
func databaseWrite(wPtr uint64) uint64 {
	wMem := pdk.FindMemory(wPtr)
	writeS := string(wMem.ReadBytes())

	fmt.Println("databaseWrite: " + writeS)

	return 0
}

func main() {}
