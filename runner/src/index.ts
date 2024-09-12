import { Test } from "@dylibso/xtp-test";

const EmbeddedObject = {
  aBoolArray: [true, false, true],
  aStringArray: ["Hello", "🌍", "World!"],
  anEnumArray: ["option1", "option2", "option3"],
  anIntArray: [1, 2, 3],
  aDate: "2024-07-23T16:03:34.000Z",
};

const inputBufferString = "Hello 🌍 World!🌍";
const expectedOutputBufferString = "Goodbye 🌍 World!🌍";

const KitchenSink = {
  anOptionalString: null,
  aString: "🌍Hello 🌍 World!🌍",
  anInt: 42,
  aFloat: 3.14,
  aDouble: 3.141592653589793238462643383279502884197,
  aBool: true,
  anUntypedObject: { hello: "world" },
  anEnum: "option1",
  anEmbeddedObject: EmbeddedObject,
  anEmbeddedObjectArray: [EmbeddedObject, EmbeddedObject],
  aDate: "2024-07-23T16:03:34.000Z",
  // the host is expected to convert `buffer` type properties to base64 strings (like the below),
  // but the bindgen'd XTP PDKs will handle this automatically, decoding base64 back to
  // the original buffer.
  aBuffer: Host.arrayBufferToBase64(
    new TextEncoder().encode(inputBufferString).buffer,
  ),
  // aBuffer: "NzIsMTAxLDEwOCwxMDgsMTExLDMyLDI0MCwxNTksMTQwLDE0MSwzMiw4NywxMTEsMTE0LDEwOCwxMDAsMzMsMjQwLDE1OSwxNDAsMTQx",
};

export function test() {
  Test.group("schema v1-draft encoding types", () => {
    let input = JSON.stringify(KitchenSink);
    let output: typeof KitchenSink = Test.call("reflectJsonObject", input)
      .json();

    matchIdenticalTopLevel(output);
    matchIdenticalEmbedded(output.anEmbeddedObject);
    output.anEmbeddedObjectArray.forEach(matchIdenticalEmbedded);

    // dates and JSON encodings between languages are a little fuzzy.
    // so, rather than test stringified equality, we test the value of
    // the date in various forms.
    matchDate(output);

    Test.assertEqual(
      "reflectJsonObject preserved optional field semantics",
      output.anOptionalString,
      KitchenSink.anOptionalString,
    );

    let inputS = KitchenSink.aString;
    let outputS = Test.call("reflectUtf8String", inputS).text();
    Test.assertEqual("reflectUtf8String preserved the string", outputS, inputS);

    let inputB = (new TextEncoder()).encode(KitchenSink.aString).buffer;
    let outputB = Test.call("reflectByteBuffer", inputB).arrayBuffer();

    // TODO compare the bytes
    Test.assertEqual(
      "reflectByteBuffer preserved the buffer length",
      outputB.byteLength,
      inputB.byteLength,
    );

    const name =
      "helloToGoodbyeReplacement properly converted, replaced, and reconverted data";
    try {
      output = Test.call("helloToGoodbyeReplacement", input).json();
      Test.assertEqual(
        name,
        new TextDecoder().decode(Host.base64ToArrayBuffer(output.aBuffer)),
        expectedOutputBufferString,
      );
    } catch (e: any) {
      Test.assert(name, false, e.message);
    }
  });

  Test.group("check signature and type variations", () => {
    // should call a the `noInputWithOutputHost` host function passing it
    // a string "noInputWithOutputHost" which it should return
    let noInputWithOutputOutput = Test.call(
      "noInputWithOutput",
      undefined,
    ).text();
    Test.assertEqual(
      "noInputWithOutput returns expected output",
      noInputWithOutputOutput,
      "noInputWithOutputHost",
    );

    // should call the `withInputNoOutputHost` host function passing it
    // JSON-encoded number 42, which the host function checks for and panics
    // if it is not that JSON value
    try {
      let withInputNoOutputOutput = Test.call(
        "withInputNoOutput",
        JSON.stringify(42),
      );
      Test.assert(
        "withInputNoOutput runs and returns no output",
        withInputNoOutputOutput.isEmpty(),
        `expected empty output, got: ${withInputNoOutputOutput.text()}`,
      );
    } catch (e: any) {
      Test.assert(
        "withInputNoOutput runs without panic",
        false,
        `host function (withInputNoOutputHost) panic with unexpected argument, must be JSON-encoded 42: ${e.message}`,
      );
    }

    const noInputNoOutput = Test.call("noInputNoOutput", undefined);
    Test.assert(
      "noInputNoOutput is called successfully",
      noInputNoOutput.isEmpty(),
      `expected empty output, got: ${noInputNoOutput.text()}`,
    );
  });

  return 0;
}

const matchIdenticalTopLevel = (output: any) => {
  // determine top-level fields that should be identical
  // NOTE: anEmbeddedObject, anEmbeddedObjectArray, and aDate are intentionally omitted here
  const matchIdentical = [
    "anOptionalString",
    "aString",
    "anInt",
    "aFloat",
    "aDouble",
    "anUntypedObject",
    "anEnum",
  ] as const;
  matchIdentical.forEach((k: typeof matchIdentical[number]) => {
    let key: keyof typeof KitchenSink = k;
    let actual = output[key];
    let expected = KitchenSink[key];
    if (key === "anUntypedObject") {
      actual = JSON.stringify(actual);
      expected = JSON.stringify(expected);
    } else if (key === 'aFloat') {
      actual = (new Float32Array([actual]))[0];
      expected = (new Float32Array([expected as number]))[0];
    }
    Test.assertEqual(
      `reflectJsonObject preserved identical value '${key}'`,
      actual,
      expected,
    );
  });
};

const matchIdenticalEmbedded = (embedded: any) => {
  // determine flat embedded items that should be identical
  // NOTE: aDate is intentionally omitted here
  const matchIdenticalEmbedded = [
    "aBoolArray",
    "aStringArray",
    "anEnumArray",
    "anIntArray",
  ] as const;
  matchIdenticalEmbedded.forEach((k: typeof matchIdenticalEmbedded[number]) => {
    let key: keyof typeof EmbeddedObject = k;
    Test.assertEqual(
      `reflectJsonObject preserved identical value '${key}'`,
      JSON.stringify(embedded[k]),
      JSON.stringify(EmbeddedObject[key]),
    );
  });
};

const matchDate = (output: any) => {
  let expected = new Date(KitchenSink.aDate);
  let actual = new Date(output.aDate);

  Test.assertEqual(
    `reflectJsonObject preserves semantics of 'date-time' formatted value`,
    actual.getTime(),
    expected.getTime(),
  );
};
