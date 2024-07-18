import { Test } from "@dylibso/xtp-test";

const EmbeddedObject = {
  aBoolArray: [true, false, true],
  aStringArray: ["Hello", "🌍", "World!"],
  anEnumArray: ['option1', 'option2', 'option3'],
  anIntArray: [1, 2, 3],
}

const KitchenSink = {
  aString: "🌍Hello 🌍 World!🌍",
  anInt: 42,
  aFloat: 3.14,
  aDouble: 3.141592653589793238462643383279502884197,
  aBool: true,
  anUntypedObject: { hello: 'world' },
  anEnum: 'option1',
  anEmbeddedObject: EmbeddedObject,
  anEmbeddedObjectArray: [EmbeddedObject, EmbeddedObject]
}

export function test() {
  let input = JSON.stringify(KitchenSink)
  let output = JSON.parse(Test.callString("reflectJsonObject", input))
  // assuming if we re-stringify them here the formatting should be the same
  Test.assertEqual("reflectJsonObject preserved the KitchenSink", JSON.stringify(output), JSON.stringify(KitchenSink))
  return 0;
}
