"""Collatz orbit of one starting value.

Reads one positive integer from the input (stdin) and follows the rule
    n -> n / 2      if n is even
    n -> 3n + 1     if n is odd
until it reaches 1, then prints the number of steps, the maximum value and the sequence.

This checks ONE starting value. Reaching 1 here says nothing about other values:
it is an experiment, not a proof of the Collatz Conjecture.
"""

import sys

# Bounds that keep a run small and predictable inside the sandbox.
MAX_START = 10**30
MAX_STEPS = 100_000
SHOW_TERMS = 200


def collatz_sequence(n: int, max_steps: int = MAX_STEPS) -> list[int]:
    if n < 1:
        raise ValueError("n must be a positive integer")

    sequence = [n]

    while n != 1:
        if len(sequence) > max_steps:
            raise RuntimeError(f"stopped after {max_steps} steps without reaching 1")
        if n % 2 == 0:
            n //= 2
        else:
            n = 3 * n + 1

        sequence.append(n)

    return sequence


def read_start(text: str) -> int:
    text = text.strip()
    if text == "":
        return 27  # the classic example when no input is given
    try:
        start = int(text)
    except ValueError:
        raise ValueError(f"not an integer: {text[:40]!r}") from None
    if start < 1:
        raise ValueError("n must be a positive integer")
    if start > MAX_START:
        raise ValueError(f"n must be at most {MAX_START}")
    return start


def main() -> int:
    try:
        start = read_start(sys.stdin.read())
        sequence = collatz_sequence(start)
    except (ValueError, RuntimeError) as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1

    shown = sequence[:SHOW_TERMS]
    print("Start:", start)
    print("Steps:", len(sequence) - 1)
    print("Maximum:", max(sequence))
    print("Sequence:", shown if len(sequence) <= SHOW_TERMS else f"{shown} … ({len(sequence) - SHOW_TERMS} more)")
    print()
    print("This checks one starting value. It is evidence about this input only, not a proof.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
