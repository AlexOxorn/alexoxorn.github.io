---
title: "Working with Lists in C"
date: 2024-06-05 00:00:00 -400
categories: [Programming]
tags: [cpp,c]
math: true
mermaid: true
---

<style>

</style>

# Working with Lists and Strings in C

One of the most common pitfalls of C for people learning it for the first time is learning how to deal with arrays and strings. This largely has to do with how unlike other languages, C does not offer clean abstractions to work with lists and strings without needing to concern yourself with memory. Instead C absolutely requires you to have to think about how memory is organized. To helpfully help newcomers, this guide will helpfully get you to develop more intuition and better understanding on how to work with arrays and strings, and some common practices.

## Stack Frames

Before we can get into any actual array code, you need to understand what "the stack" is, and what it refers to. A program runs, you need something to hold all of the data for local variables. That "something" is what is known as a stack frame. The collection of stack frames is called a "stack", so named because calling a function puts another frame on the stack, and a function returning, removes the top most element.

Now despite this being a thing is most languages, how they are handled between languages can help shine a light on how most languages and C differ.

Let's look at Python first as an example.

### Stack Frames in Python

```python
def foo(a, x, b):
    ax = a + x
    ax2 = ax * ax
    return ax2 + b

first = 2
second = 3
third = 10
result = foo(first, second, third)
print(result)
```

Before we call the function `foo` we have our box that holds the global variables `first`, `second`, and `third` which point to their respective values. What is important to know that python effectively treats the stack frames and values as abstract values in and of themselves.

![Python Globals](/assets/06-C-array/python_1_1.png)

When we call the foo function, and pass in the arguments, that ends up creating a new stack frame for the local variables of `foo`. It then assigns the argument variables to values passed to the function.

![Python Foo Local](/assets/06-C-array/python_1_2.png)

Then after a bunch of math, when it wants to return the result, it takes the value to return, then the stack frame above uses the return value to assign the `result` variable.

![Python Return](/assets/06-C-array/python_1_3.png)

Then, the foo function having returned, the stack frame also gets deleted.

![Python Deref Foo](/assets/06-C-array/python_1_4.png)

Something that you should notice is that in the Python example of the stack frame, there was a lot of abstractions being made. Simple boxes for the stack frames and arrows pointing to values. And that has a lot to do with how the python virtual machine handles all of the memory stuff on its own, so the python coder only has to concern themselves with the more abstract relations.

C on the other hand, does the opposite.

### C Stack Frames

In C, we actually care about RAM in a more direct fashion. Looking at similar example code, let's see how the memory is laid out.

On the right is a small part of RAM, and we see that from the get go, that ram as carved out  a small piece of RAM for the variables `first`, `second`, and `third`. It also worth noting that it has also reserved a spot for `result` despite not being defined yet.

It is this set of 16 bytes that are referred to as a Stack Frame.

![C Stack Frame](/assets/06-C-array/C_1_1.png)

When we call Foo, it then carves out 20 bytes from the stack to be used for the local variables of foo. Well sort of.

![C Foo Stack Frame](/assets/06-C-array/C_1_2.png)