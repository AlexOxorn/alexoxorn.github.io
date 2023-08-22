---
title: "State Spaces: A Different Perspective on Dikstra"
date: 2023-08-21 15:36:00 -400
categories: [AdventOfCode]
tags: [cpp,adventofcode]
math: true
---

## Dikstra's Algorithm Introduction

I'm going to assume for sake of brevity that the reader is aware of Dikstra's Algorithm and its derivative, the A* algorithm. If you don't, you can read up on Dikstra [here](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm) and A* [here](https://en.wikipedia.org/wiki/A*_search_algorithm)

Dikstra's Algorithm is often presented as a path finding algorithm, and often uses a physical analogy to get across its use, however that can be a very limited way to describe its use.

To give an example, let's look at [Advent of Code 2022 Day 19](https://adventofcode.com/2022/day/19)

## Advent of Code 2022 Day 19

The main problem posed by Advent of Code 2022 Day 19 (herein referred to as the 202219 problem) is given a blueprint to create certain mineral mining robots  and starting with a single ore mining robot, can you determine what is the maximum amount of geodes can you mine in a certain amount of time?

For example, the Blueprint
```
Blueprint 1:
  Each ore robot costs 4 ore.
  Each clay robot costs 2 ore.
  Each obsidian robot costs 3 ore and 14 clay.
  Each geode robot costs 2 ore and 7 obsidian.
```

Within 24 minutes, you can create 9 geodes by making
- a clay robot at minutes 2, 5, 7, and 12
- an obsidian robot at minutes 11 and 15
- and a geode collecting robot at minutes 18 and 21

Now I will admit that at first, this does not appear to be a Dikstra issue at all. There isn't really a _path_ that needs to be minimized. In fact that this seems to be quite the opposite, the goal is to maximize something, and yet Dikstra works here at finding the answer.

## Turning the Problem Into a Graph

Often times, the nodes of a graph tend to representing something concrete, like a location in space or a particular webpage; their edges are equally intuitive, moving from one space to another, or linked between websites respectively. In reality, nodes can represent so much more, and here, we will represent something more abstract. The nodes of our graph will represent a state, and the edges are actions which move from one state to another.

### The Nodes as States

So what is a "state" in this case. For this problem it makes sense to represent a state as a collection of
1. The current amount of materials we have
2. The current amount of mining robots we have
3. How much time has passed

### The Edges as Decisions

With that being the state what are the edges.
For each minute, you are allowed to either build a robot if you have the materials to do so, or you are can do nothing and have each of your robots collect 1 more ore each.

For example, using the above blueprints, say we have a state
```yaml
time passed: 20
material:
    ore: 4
    clay: 25
    obsidian: 7
    geode: 2
robots:
    ore: 1
    clay: 4
    obsidian: 2
    geode: 1
```

We have 5 options:

We can build no robots resulting in the state:

```yaml
time passed: 21
material:
    ore: 5
    clay: 29
    obsidian: 9
    geode: 3
robots:
    ore: 1
    clay: 4
    obsidian: 2
    geode: 1
```

We can build an ore robot resulting in the state

```yaml
time passed: 21
material:
    ore: 1
    clay: 29
    obsidian: 9
    geode: 3
robots:
    ore: 2
    clay: 4
    obsidian: 2
    geode: 1
```

We can build a clay robot resulting in the state

```yaml
time passed: 21
material:
    ore: 3
    clay: 28
    obsidian: 9
    geode: 3
robots:
    ore: 1
    clay: 5
    obsidian: 2
    geode: 1
```

We can build an obsidian robot resulting in the state

```yaml
time passed: 21
material:
    ore: 2
    clay: 14
    obsidian: 9
    geode: 3
robots:
    ore: 1
    clay: 4
    obsidian: 3
    geode: 1
```

Or we can build a geode robot resulting in the state

```yaml
time passed: 21
material:
    ore: 3
    clay: 29
    obsidian: 2
    geode: 3
robots:
    ore: 1
    clay: 4
    obsidian: 2
    geode: 2
```

### The Cost as Lost Opportunity

In Dikstra's algorithm, the cost of moving through an edge is often thought of as a distance, or a representation of the difficulty in moving between nodes, and it is _that_ cost which Dikstra is trying to minimize. At first glance, this doesn't seem like something that works in this case. However, if we dissect what about the cost makes Dikstra work, we can leverage it to create a maximization algorithm.

At its fundamental level, for Dikstra to work given a set of costs $$ C $$, you need an add function $$ +: C \times C \to C $$ to add the cost of going from state $$ a \rightarrow b $$ and $$ b \rightarrow c $$, and a binary relation $$ \leq $$ on $$ C $$ such that $$ a \leq a + b \ \  \forall  \ \  a,\ b \in C $$

Given these requirements, how would we model acquisition? The answer is by shifting our perspective from what we gain from each step, to what we lost from each step. Time to think like a capitalist.

First for this to work, we need to conceptualize some idea of a maximum amount of ore we can obtain, and then our cost for each minute will represent how much we fell short of that maximum.

In the problem we have 24 minutes to mine, and each minute we can create 1 robot. Given that, we can assume our maximum is to have 24 of each robot generating 24 of each rock each minute.

Going back to this state as an example:

```yaml
time passed: 20
material:
    ore: 4
    clay: 25
    obsidian: 7
    geode: 2
robots:
    ore: 1
    clay: 4
    obsidian: 2
    geode: 1
```

The cost of doing nothing would be
$$ (24 - 1) + (24 - 4) + (24 - 2) + (24 - 1) = 88 $$

As we lost out on 88 rocks... except that is not *really* our cost.

The problem *only* cares about maximizing geodes, but if we only tracked only geodes, doing nothing and building non geode robots are treated equally in regards to which gets us to geodes faster, which they don't

In reality, the best cost is to instead of adding the 4 lost rock opportunities, just make a list out of them. $$ (23, 20, 22, 23) $$
In other words, for us $$ C \equiv \mathbb{N} \times \mathbb{N} \times \mathbb{N} \times \mathbb{N} $$

This might seem bizarre to some. The idea of costs being anything that is not a number is... uncommon to say the least. But remember, all we need to make this work is a notion of addition and ordering.

In our case, to add costs, we can add them rock by rock; to compare costs, we compare geodes, then use obsidian to tie break, then clay, the oren. At this point I feel like it fairly obvious that $$ a \leq a + b \ \  \forall  \ \  a,\ b \in C $$

Implementing this in c++, we get something similar to:

```cpp
struct cost {
    uint16_t ore, clay, obsidian, geode;
};

cost operator+(cost a, cost b) {
    cost result;
    result.ore = a.ore + b.ore;
    result.clay = a.clay + b.clay;
    result.obsidian = a.obsidian + b.obsidian;
    result.geode = a.geode + b.geode;
    return result;
}

auto operator<=>(cost a, cost b) {
    auto eq = std::strong_ordering::equal;
    auto order = std::strong_ordering::equal;
    if (auto order = a.geode <=> b.geode; order != eq)
        return order;
    if (order = a.obsidian <=> b.obsidian; order != eq)
        return order;
    if (order = a.clay <=> b.clay; order != eq)
        return order;
    return a.ore <=> b.ore;
}
```

### Dikstra's End

Once we reach a state at the 24 minute mark with Dikstra, we know we're done. At that point, the amount of each rock we have is just the theoretical maximum minus the lost opportunity.

And with this, in true math fashion, we have proved that Dikstra _will_ find instead of actually finding the answer and there is a reason for that, as things are now, we may never find that answer.

## The Use of A*

So the main issue of Dikstra is that though it _will_ find a shortest path, it makes no claim about how fast it will do it. An interesting quirk of Dikstra is that if all of the costs between nodes are the same, you functionally just have a type of breath first search. In our case, though our costs are all the same, the seldomly reach our hypothetical maximums, and as such our costs are fairly uniform, leading to breath first search like speeds.
More specifically, since each node can have anywhere between 1 and 4 options (if we can build any of the 4 robots, doing nothing is _objectively_ a bad option and can be ignored), we are looking at nodes are the scale of $$ 4^{24} = 2.8 * 10^{14} $$. And that is not even considering part 2 of the problem which looks at 32 minutes of mining which pushes it to a similar order of magnitude of $$ 4^{32} = 1.8 * 10^{19} $$

Context of scale: $$10^{14}$$ nanoseconds is 1 day. $$10^{19}$$ nanoseconds is 316 years

To speed up our search algorithm, we will use the A* algorithm. The A* algorithm is essentially just Dikstra's algorithm, but uses a heuristic calculation on how far away a node is to the end on each node to guide the algorithm in regards to which node are more likely to be part of the shortest path. The main issue with A* is that if you are not careful, it actually might not give you the shortest path. The way to make sure that A* gives the shortest path, the heuristic function must _always_ underestimate the true distance to the end.

Now this is an interesting balancing act. Overestimate too little, you essentially just get Dikstra (heuristics of 0 _are_ the same as Dikstra). But be a bit too optimistic, you end up accidentally overestimating and you won't know if you have a true shortest path.

What I did for my heuristic is to assume I build a new robot of each type at each time step, regardless of material. For example if I have 4 ore robots and I am at minute 21 out of 24, my heuristic for ore becomes: $$ (24 - 4) + (24 - 5) + (24 - 6) $$.
Or more formally: 

$$ h_x(t, R, T) = \sum_{N=0}^{T - t} T - (R_x + N) $$ 

Where T is the total time of the operation (24 or 32 minutes), t is the current time passed, and R is the current number of robots, and x refers to which mineral in consideration.

## Conclusion

With that under our belt, we now have used Dikstra's algorithm to find something other than a shortest path. We abstracted what the algorithm can work on, to work on abstract state spaces, where edges are the actions between states, and costs are whatever we define such at it obeys the prerequisites of Dikstra, while also allowing for our desired final answer to be retrievable from the total cost.

## Solution Implementation

Here is a link to my implementation of this Algorithm

[2022 Day 19](https://github.com/AlexOxorn/AdventOfCode/blob/main/puzzles/2022/src/day19.cpp)