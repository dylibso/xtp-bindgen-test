package main

import (
	"fmt"

	"github.com/extism/go-pdk"
)

//go:export reflectJsonObjectHost
func reflectJsonObjectHost(kPtr uint64) uint64 {
	kMem := pdk.FindMemory(kPtr)
	k := string(kMem.ReadBytes())

	// TODO should validate that we get json by trying to parse it
	fmt.Println(k)

	kRet := pdk.AllocateString(k)
	return kRet.Offset()
}

//go:export reflectUtf8StringHost
func reflectUtf8StringHost(kPtr uint64) uint64 {
	kMem := pdk.FindMemory(kPtr)
	k := string(kMem.ReadBytes())

	// TODO should validate that we get utf8 string
	fmt.Println(k)

	kRet := pdk.AllocateString(k)
	return kRet.Offset()
}

//go:export reflectByteBufferHost
func reflectByteBufferHost(kPtr uint64) uint64 {
	kMem := pdk.FindMemory(kPtr)
	k := kMem.ReadBytes()

	// TODO should validate that we get bytes somehow?

	kRet := pdk.AllocateBytes(k)
	return kRet.Offset()
}

func main() {}
