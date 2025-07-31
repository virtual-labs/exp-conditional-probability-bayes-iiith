## Overview 
Probability is all around us—whether it's predicting the weather, filtering out spam emails, or diagnosing a disease. One of the most powerful tools in probability theory is **Bayes’ Theorem**, which allows us to update our beliefs in light of new evidence.

This experiment is designed to help students explore **conditional probability** and **Bayes' Theorem** using engaging visual tools and real-life contexts.

---

## What is Conditional Probability?

Conditional probability is the probability of an event occurring **given** that another event has already occurred.

- **Notation**: `P(A|B)` is the probability of event A occurring given that B has occurred.
- **Formula**:  
  \[
  P(A|B) = \frac{P(A \cap B)}{P(B)}
  \]
  
  This tells us how likely A is, *assuming* that B is known to have happened.

### Example:
- Event A: A person has a cold.
- Event B: The person sneezes.

`P(A|B)` answers: *If a person is sneezing, how likely is it that they have a cold?*

This is not the same as `P(B|A)` – which would be the probability that a person sneezes **if** they have a cold.

---

## Bayes' Theorem: Turning Probabilities Around

Often, we know `P(B|A)`, but we really want to know `P(A|B)`. This is where Bayes’ Theorem comes in:

\[
P(A|B) = \frac{P(B|A) \cdot P(A)}{P(B)}
\]

It combines:
- `P(B|A)`: How likely is the evidence, given the cause?
- `P(A)`: The base rate (prior probability) of the cause.
- `P(B)`: The total probability of the evidence.

---

## Visual Tools Used

To build intuition, we explore these representations:

### 1. Venn Diagrams  
Visualize overlapping events as regions. Areas represent probability mass.  
Useful for understanding intersections (`P(A ∩ B)`).

### 2. Population Grids  
Typically a 10×10 or 20×20 grid where each cell represents an individual or event.  
Example: Each cell could represent whether a person has a disease and whether they test positive.

### 3. Probability Trees  
Break down compound events step by step.  
Example:  
- First branch: Person has disease or not.  
- Second branch: Test is positive or negative.  
Multiply along paths to get combined probabilities.

---

## Interactive Features

- **New Scenario** button: Generates fresh problems like spam filtering, quality checks, etc.
- **Reveal/Hide Probabilities** toggle: Let’s you see/hide intermediate steps.
- **Answer Area**: Click-based selection of regions (in Venn/Grid) or construction of tree paths.

### Feedback System
- Incorrect choices result in visual hints and corrections.
- Errors in selecting `P(B|A)` instead of `P(A|B)` are flagged with explanatory messages.

---

## Real-World Scenarios You’ll Encounter

- **Medical Testing**:  
  “10% of people have disease X. A test detects it correctly 90% of the time and has a 20% false positive rate.”  
  Can you compute the actual probability that someone has the disease **given** a positive test?

- **Spam Detection**:  
  “80% of spam emails contain the word ‘free’. Only 10% of non-spam emails do.”  
  What’s the chance an email is spam **if** it contains the word “free”?

- **Factory Quality Control**:  
  “5% of parts are defective. A sensor flags 90% of defective parts, but also incorrectly flags 5% of good parts.”  
  How trustworthy is the sensor?

---

## Common Pitfalls (That This Activity Helps You Avoid)

- Confusing `P(A|B)` with `P(B|A)`.
- Misinterpreting base rates or ignoring prior probabilities.
- Forgetting to normalize probabilities in Bayes’ formula.
- Miscounting regions or cells in visual tools.

---

## Fun Fact

Bayes’ Theorem was first proposed by **Rev. Thomas Bayes** in the 18th century but only published after his death. Today, it’s fundamental to machine learning, medical diagnosis, and even search engines.

---

## Why This Matters

Conditional reasoning is essential to decision-making under uncertainty. From health policy to artificial intelligence, understanding how to update beliefs based on new evidence is a critical skill for any data-driven field.

This activity helps you build that intuition—not just by memorizing formulas, but by interacting with them visually and logically.

---
