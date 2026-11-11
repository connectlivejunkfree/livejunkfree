"use client";

/**
 * Google Maps placeholder: a light designed card (pin, rating, towns) that loads
 * the real Google Maps embed only when the visitor taps "Show map". The Maps
 * iframe is ~1 MB of scripts, so it never loads on its own.
 * Content used: content/site.json (mapEmbed, rating, googleBusinessProfile).
 */
import { useState } from "react";
import { site } from "@/lib/content/client";
import { Icon } from "../icons";

const SPOTS = [
  ["Toronto", 58, 62],
  ["Mississauga", 36, 70],
  ["Brampton", 32, 50],
  ["Vaughan", 48, 40],
  ["Markham", 66, 42],
  ["Pickering", 80, 50],
  ["Oshawa", 92, 46],
  ["Newmarket", 56, 20],
] as const;

export function MapFacade({ className }: { className?: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className={className ? `mapf ${className}` : "mapf"}>
      {on ? (
        <iframe src={site.mapEmbed} title="Live Junk Free on Google Maps" className="mapf-frame" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      ) : (
        <>
          <div className="mapf-bg" aria-hidden="true">
            {SPOTS.map(([name, x, y]) => (
              <span key={name} className="mapf-dot" style={{ left: `${x}%`, top: `${y}%` }}>
                <i />
                {name}
              </span>
            ))}
            <span className="mapf-pin" style={{ left: "52%", top: "52%" }}>
              <Icon name="truck" />
            </span>
          </div>
          <div className="mapf-card">
            <b>Live Junk Free</b>
            <span className="small muted">
              ★ {site.rating.display} · {site.rating.countDisplay}+ Google reviews · Serving the GTA
            </span>
            <button type="button" className="btn btn-dark btn-sm" onClick={() => setOn(true)}>
              Show map
            </button>
          </div>
        </>
      )}
    </div>
  );
}
