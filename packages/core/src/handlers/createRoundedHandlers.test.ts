import { vi, describe, it, expect } from "vitest";
import { createStyleBuilder } from "../createStyleBuilder";
import { DEFAULT_CONSTRAINTS, defaultHandlers } from "./defaultHandlers";
import { createBorderHandlers } from "./createBorderHandlers";
import { createRoundedHandlers } from "./createRoundedHandlers";
import { DefaultConstraints } from "../theme";

vi.mock("react-native", () => ({
  StyleSheet: {
    hairlineWidth: 0.5,
  },
}));

const { styles } = createStyleBuilder({});
const C = DefaultConstraints.borderRadii;

describe("createBorderHandlers", () => {
  const cases: [string, object, object][] = [
    // rounded:
    ["rounded:lg", styles("rounded:lg"), { borderRadius: C["lg"] }],
    ["rounded:[17]", styles("rounded:[17]"), { borderRadius: 17 }],
    // rounded-t:
    [
      "rounded-t:lg",
      styles("rounded-t:lg"),
      { borderTopLeftRadius: C["lg"], borderTopRightRadius: C["lg"] },
    ],
    [
      "rounded-t:[17]",
      styles("rounded-t:[17]"),
      { borderTopLeftRadius: 17, borderTopRightRadius: 17 },
    ],
    // rounded-b:
    [
      "rounded-b:lg",
      styles("rounded-b:lg"),
      { borderBottomLeftRadius: C["lg"], borderBottomRightRadius: C["lg"] },
    ],
    [
      "rounded-b:[17]",
      styles("rounded-b:[17]"),
      { borderBottomLeftRadius: 17, borderBottomRightRadius: 17 },
    ],
    // rounded-l:
    [
      "rounded-l:lg",
      styles("rounded-l:lg"),
      { borderBottomLeftRadius: C["lg"], borderTopLeftRadius: C["lg"] },
    ],
    [
      "rounded-l:[17]",
      styles("rounded-l:[17]"),
      { borderBottomLeftRadius: 17, borderTopLeftRadius: 17 },
    ],
    // rounded-r:
    [
      "rounded-r:lg",
      styles("rounded-r:lg"),
      { borderBottomRightRadius: C["lg"], borderTopRightRadius: C["lg"] },
    ],
    [
      "rounded-r:[17]",
      styles("rounded-r:[17]"),
      { borderBottomRightRadius: 17, borderTopRightRadius: 17 },
    ],
  ];

  it.each(cases)(
    "builder(...%s)=%s equals %s",
    (_, actualOutput, expectedOutput) => {
      expect(actualOutput).toEqual(expectedOutput);
    }
  );

  it("allows for custom constraints", () => {
    const { styles } = createStyleBuilder({
      theme: {
        borderRadii: { foo: 6, bar: 9 },
      },
    });

    expect(styles("rounded:foo")).toEqual({ borderRadius: 6 });
    expect(styles("rounded:bar")).toEqual({ borderRadius: 9 });
    // @ts-expect-error
    expect(styles("rounded:baz")).toEqual({});
  });
});
