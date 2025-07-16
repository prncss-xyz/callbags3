# TODO

- either
  - rename err, succ to error, success
- machine

  - direct:
    - improve inference: use init, event optional
  - sub
  - slice
  - make always access emit
  - forbid init to access always
  - move emit out of send param (maybe)
  - serialization

- tests (improve coverage)

- fold remove init from inside def

- id `=>` identity

- merge to utils

- state machine

  - base
  - combo
  - operators
  - extract
  - effects

- state machine exemples

  - undo/redo
  - games
  - wordCOunt
  - zipCmp

- proc prototype ordering

- pick/multi

- match

- operators
  - fallback
  - dedupe
  - mapErr
  - flipErr
  - race
  - all

## Next

- optics

## Later

- group et cie, add fold argument
- unions
  - merge tag and union or remove both

## Maybe

- value `->` payload
- async iterator
- machine: default

## Blocked

- merge nothing.void() to nothing.of()
- when scan is called with a fold having an init, it should immediately call next, but we cannot do that beacause of index
