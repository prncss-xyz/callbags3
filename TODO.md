# TODO

- result ?

- either
  - rename err, succ to error, success
- machine

  - effects
  - direct:
    - improve inference: use init, event optional
  - slice
  - history
  - make always access emit
  - forbid init to access always
  - move emit out of send param (maybe)
  - serialization
  - ?? reverse machine

- tests (improve coverage)

- fold remove init from inside def

- id `=>` identity

- merge to utils

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
