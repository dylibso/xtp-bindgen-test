package main

import (
	"fmt"

	"github.com/extism/go-pdk"
)

//go:export reflectObjectHost
func reflectObjectHost(kPtr uint64) uint64 {
	kMem := pdk.FindMemory(kPtr)
	k := string(kMem.ReadBytes())

	fmt.Println(k)

	kRet := pdk.AllocateString(k)
	return kRet.Offset()
}

func main() {}
