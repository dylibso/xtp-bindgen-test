import { Test } from "@dylibso/xtp-test";

export function test() {
  let res = Test.callString("processText", "hello world")
  Test.assertEqual("processText('hello world') = [5,5]", res, "[5,5]")

  res = Test.callString("convertTemperature", "celsius")
  let parsed = JSON.parse(res)
  Test.assertEqual("convertTemperature.value = 123", parsed.value, 123)
  Test.assertEqual("convertTemperature.scale = celsius", parsed.scale, 'celsius')

  return 0;
}
