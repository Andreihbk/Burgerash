import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { splitDigits, stripDiacritics } from "@/lib/display";

const NUMBER_CLASS = "font-nunito font-extrabold tabular-nums";

/**
 * Wrap the text of any `.font-display` element:
 * - diacritics are transliterated (the display font has no ă â î ș ț),
 * - digits (prices, totals, weights, quantities, order numbers) render in bold Nunito with tabular figures.
 * Elements passed as children are left untouched.
 */
export function Display({ children }: { children?: ReactNode }) {
  return (
    <>
      {Children.map(children, (child, index) => {
        if (typeof child !== "string" && typeof child !== "number") return isValidElement(child) ? child : (child ?? null);
        const parts = splitDigits(stripDiacritics(String(child)));
        return (
          <Fragment key={index}>
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <span key={i} className={NUMBER_CLASS}>
                  {part}
                </span>
              ) : (
                part
              ),
            )}
          </Fragment>
        );
      })}
    </>
  );
}
