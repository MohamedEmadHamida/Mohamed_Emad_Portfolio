"use client";

import { Fragment, useState } from "react";
import { voices } from "@/lib/content";
import { pad2, vars } from "@/lib/client";

/** Client reviews: pick a name on the left, the quote types in word by word on the right. */
export function Voices() {
  const [current, setCurrent] = useState(0);
  const v = voices[current];
  const words = `“${v.quote}”`.split(" ");

  return (
    <div className="grid12 voices">
      <ul className="c5">
        {voices.map((x, i) => {
          const go = () => setCurrent(i);
          return (
            <li key={x.name}>
              <button className="voice" type="button" aria-pressed={i === current} onClick={go} onMouseEnter={go} onFocus={go}>
                <span className="i">{pad2(i + 1)}</span>
                <span>
                  <span className="nm">{x.name}</span>
                  <span className="label">{x.project}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <blockquote className="c7 quote" data-reveal>
        {/* The key restarts the word animation when the quote changes. */}
        <p key={current}>
          {words.map((w, i) => (
            <Fragment key={i}>
              <span style={vars({ "--i": i })}>{w}</span>{" "}
            </Fragment>
          ))}
        </p>
        <footer className="label">{v.name} — Client on Mostaql · Translated from Arabic</footer>
      </blockquote>
    </div>
  );
}
