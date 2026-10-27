namespace Forma.Layout.Probe

open System

/// Deterministic, splittable randomness (SplitMix64). A case's every property is
/// drawn from a seed derived from (run seed, family, index, property name), so
/// one case reproduces from its seed alone and changing one generator never
/// shifts the values another draws.
[<RequireQualifiedAccess>]
module Seed =
    let private mix (z: uint64) =
        let z = (z ^^^ (z >>> 30)) * 0xbf58476d1ce4e5b9UL
        let z = (z ^^^ (z >>> 27)) * 0x94d049bb133111ebUL
        z ^^^ (z >>> 31)

    /// FNV-1a over UTF-16 code units: stable across runs and platforms.
    let private hash (s: string) =
        s |> Seq.fold (fun (h: uint64) (c: char) -> (h ^^^ uint64 c) * 0x100000001b3UL) 0xcbf29ce484222325UL

    let derive (seed: uint64) (label: string) = mix (seed + 0x9e3779b97f4a7c15UL * (hash label ||| 1UL))

    /// A float in [0, 1).
    let unit (seed: uint64) = float (mix seed >>> 11) / float (1UL <<< 53)

    let between (seed: uint64) (lo: float) (hi: float) = lo + unit seed * (hi - lo)

    let int (seed: uint64) (lo: int) (hi: int) = lo + int (unit seed * float (hi - lo + 1)) |> min hi

    let pick (seed: uint64) (items: 'T list) = items[int seed 0 (items.Length - 1)]

    let chance (seed: uint64) (p: float) = unit seed < p

    let text (seed: uint64) = $"{seed:x16}"

    let parse (s: string) = Convert.ToUInt64(s, 16)
