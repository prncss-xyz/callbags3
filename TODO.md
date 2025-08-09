# TODO

- result type
    - Result<Success, Failure>

- either
  - rename err, succ to error, success
- machine

  - history
  - ? split modal from sum
  - effects
  - direct:
    - improve inference: use init, event optional
  - make always access emit
  - forbid init to access always
  - move emit out of send param (maybe)
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

## Events

```typescript
(data: Data, send: (s: State) => void) => () => void
{
    init: (data: Data, send: (s: State) => void),
    change: (data: Data, send: (s: State) => void),
    exit: (data: Data, send: (s: State) => void)
}
```

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

## Références

[memoize](https://github.com/caiogondim/fast-memoize.js/blob/master/src/index.js)
