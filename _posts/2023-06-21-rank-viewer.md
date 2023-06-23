---
title: Real Time Score Progress Bar Viewer
date: 2023-06-23 15:36:00 -400
categories: [Projects]
tags: [cpp,oxlib,sdl2]
---

## Github Page

[Rank Viewer](https://github.com/AlexOxorn/rank_viewer)

## Intro

While playing various Sonic games, I've always been the type of person to try to go for the highest rank for every level. I just love the challenge and sense of perfection, but there has always been something nagging me.
Though the game does give you your current score in most games, there are a variety of bonuses given to you at the end of a level, while at the same time, not ever telling you what the score requirements are. As a result, often times, it is really hard to know how close you are.

What I've always wanted to have is some way to visualize the interplay between increasing basic score as well as the decreasing time bonus in real time, plus the relative contributions of all of the different types of points.

As a result of this desire, I have created that very tool, a way to read game data, interpret that data and use it to construct a realtime view of the games score, potentinal end of level bonuses, and markers for the rank thresholds.

This tool can be used for certain Sonic the Hedgehog games to create realtime progress bars of your score including any
end of level bonus as well as visualizing the score milestones to achieve certain ranks

A Demonstration can be found here using Sonic Colours as an Example

{% include embed/youtube.html id='hROWg-yJelY' %}

This blog post will go over the different parts of the following the project, with the context of what makes it work for Sonic Colours


## Reading Memory from Dolphin

### The Dolphin Process class heirarchy

As of now, support for Sonic Colours extends to only cover running the Wii version using the Dolphin-emu emulator. The [`dolphin_process`](https://github.com/AlexOxorn/rank_viewer/blob/master/memory/unix/dolphin_process.cpp) class is responsible for reading the memory of the game.

Its class heirarchy looks like
`dolphin_process` ← `native_process` ← `abstract_process`

#### Abstract Process

This class is what all functions using a reader would expect. It has a simple constructor which takes in a process id, as well requires that subclasses define the following functions

```cpp
virtual size_t read_memory_raw(u64 address, void* buffer, size_t size, int length) = 0;
virtual bool wrong_endian() const = 0
```

The first is a very familar stdio looking function to read data from a particular address.

The second is used to determine if the data being read is the opposite endian to the native system.

Using this function allows the abstract process to define templated typed versions that will handle size and length values

```cpp
template<std::trivially_copyable T>
size_t read_memory(u64 address, T* result) {
    size_t amount_read = this->read_memory_raw(address, result, sizeof(T), 1);
    if (should_endian_swap<T>()) ox::bswap(result, amount_read);
    return amount_read;
}

template<std::trivially_copyable T, std::size_t N>
size_t read_memory(u64 address, std::array<T, N>* result) {
    size_t amount_read = this->read_memory_raw(address, result, sizeof(T), N);
    if (should_endian_swap<T>()) ox::bswap(result->data(), amount_read);
    return amount_read;
}
```

#### Native Process

This class is used to read memory directly from a native processes address space. It uses the `/proc/{pid}/mem`{: .filepath} device file, and basic stdio `fread`, `fseek` and `fflush`.

In regards to the endianess, since this class is always reading native processes, it will allways be correct

```cpp
size_t native_process::read_memory_raw(u64 address, void* buffer, size_t size, int length) {
    fseek(mem_file.get(), static_cast<long>(address), SEEK_SET);
    size_t read_result = fread(buffer, size, length, mem_file.get());
    fflush(mem_file.get());
    return read_result;
}

bool native_process::wrong_endian() {
    return false;
}
```

#### Dolphin Process

Finally the dolphin process class's job is to translate Gamecube/Wii virtual addresses into Dolphin's own virtual address.

Firstly the constructor has to look through `/proc/{pid}/maps`{: .filepath} to find the memory location holding the Wii's memory. The logic is not one I can take credit for, and instead the logic came from adapting [This github project](https://github.com/aldelaro5/Dolphin-memory-engine/blob/master/Source/DolphinProcess/Linux/LinuxDolphinProcess.cpp#L17) which offers a gui interface for tracking Dolphin's memory.

To actually read the data, it just delegate to its parent's `read_memory_raw` function after translating the address.

lastly, because Gamecubes and Wiis are specifically big-endian systems, it has to be checked if the native system is also big-endian.



```cpp
size_t dolphin_process::read_memory_raw(u64 address, void* buffer, size_t size, int length) {
    return native_process::read_memory_raw(mapped_address(address), buffer, size, length);
}

u64 dolphin_process::mapped_address(u64 address) const {
    if (mem2_present && address > dolphin_process::wii_memory_start) {
        return address - dolphin_process::wii_memory_start + mem2_address;
    } else if (address > dolphin_process::gc_memory_start) {
        return address - dolphin_process::gc_memory_start + emu_ram_address;
    }
    return address;
}

bool wrong_endian() {
  return std::endian::native != std::endian::big;
}
```


### Varible Helper Macros

Inside the include folder [the helpers file](https://github.com/AlexOxorn/rank_viewer/blob/master/memory/include/helpers.h) contains some helper macros which will help the data in the game folder to define which addresses are associated with each value. Using each macro will define a `get_{name}` function which will get the value of that variable and return the associated type and possibly a `{name}_address` variable to use at a later point.

```cpp
template <typename type, std::convertible_to<u64> T>
requires std::is_trivially_copyable_v<type>
type get_address(process& process, T address, u64 offset = 0) {
    type to_return;
    process.read_memory(address + offset, &to_return);
    return to_return;
}

template <typename type, int length, std::convertible_to<u64> T>
requires std::is_trivially_copyable_v<type>
std::array<type, length> get_array_address(process& process, T address) {
    std::array<type, length> to_return{};
    process.read_memory(address, &to_return);
    return to_return;
}

template <typename type, int length>
requires std::is_trivially_copyable_v<type>
type get_array_address_at(process& process, u32 address, unsigned index) {
    type to_return{};
    process.read_memory(address + (index * sizeof(type)), &to_return);
    return to_return;
}
```

| Macro        | Use              | Get Function Definition |
|:-----------------------------|:-----------------|--------:|
| `GAME_VARIABLE(type, name, address)` | Defines a simple variable associated with a particular address and type | `get_address<{type}>(process, {address})`
| `GAME_INDIRECT_VARIABLE(type, name, base, offset)` | Defines a variable whose value exists pointed to by a dynamic address |`get_address<{type}>(process, get_{base}(p), {offset});`
| `GAME_VARIABLE_OFFSET(type, name, address, offset)` | Defines a variable whose value exists at a dynamic offset to a static address | `get_address<{type}>(process, {address}, get_{offset}(p) * sizeof({type}))`
| `GAME_ARRAY_VARIABLE(type, name, address, size)` | Defines an array variable associated with a particular address and type | `get_array_address<{type}, {size}>(process, {address})`

GAME_ARRAY_VARIABLE also defines a helper function to get a particular value at a given index of an array
```cpp
{type} get_{name}_at(process& p, unsigned index) {
  return get_array_address_at<{type}, {size}>(p, {address}, index);
}
```

## Displaying The Graphics

### Using SDL2

To actually draw the data, the game engine SDL2 was used, which is a very bare bones engine with ability to load textures, draw simple shapes, and use GPU rendering.

SDL2 being a C library, there is a lot of use of free standing pointers with custom allocators and deallocators. To help manage all of this, a very simple wrapper class is used which both holds with it any necissary data, and defines convenices wrappers over common SDL functions.

As well, `unique_ptr`s were defined with custom deleters for the major pointer types used.

An abridged version of the class looks like the following. The full version of the class can be found [here.hpp](https://github.com/AlexOxorn/ox_lib/blob/master/include/ox/canvas.h#L39) and [here.cpp](https://github.com/AlexOxorn/ox_lib/blob/master/src/canvas.cpp)

```cpp
#define WRAP_SDL_POINTER(ARG_TYPE, NAME) std::unique_ptr<ARG_TYPE, struct ARG_TYPE##_destroyer>;\
struct ARG_TYPE##_destroyer { auto operator()(ARG_TYPE * _p) { return NAME(_p);} };

using sdl_window = WRAP_SDL_POINTER(SDL_Window, SDL_DestroyWindow)
using sdl_renderer = WRAP_SDL_POINTER(SDL_Renderer, SDL_DestroyRenderer)
using sdl_texture = WRAP_SDL_POINTER(SDL_Texture, SDL_DestroyTexture)

class sdl_instance {
    sdl_window _window;
    sdl_renderer _screen_renderer;
    std::unordered_map<std::string, texture> textures;
    color background_color;
  public:
    explicit sdl_instance(
        const std::string& name, bool renderer, position _size, position _position
    );
    void replace_renderer() {
        _screen_renderer = sdl_renderer{SDL_CreateRenderer( _window.get(), -1, SDL_RENDERER_ACCELERATED )};
    }
    void set_renderer_color(color c, int alpha = 0xff) {
        SDL_SetRenderDrawColor(_screen_renderer.get(), c.r, c.g, c.b, alpha);
    }
    void clear_render() {
        reset_renderer_color();
        SDL_RenderClear( _screen_renderer.get() );
    }

    bool load_texture(const std::string& name, const stdf::path& path, SDL_bool key, color key_color); 
    bool load_text(const std::string& name, const stdf::path& ttf_path, int size, const std::string& s, SDL_Color color);
}
```

### Drawing Functions

Most of the common building blocks for drawing the progress bar can be found in [display/rankX.cpp](https://github.com/AlexOxorn/rank_viewer/blob/master/display/rankX.cpp).

The main functions used to draw are:
```cpp
int draw_score_progress_bar(
        ox::sdl_instance& win,
        const std::span<const score_data> scores,
        int highmark,
        dimensions size,
        bool clear_render
)
```
Which, given an array of scores (name, colour, and points), and a highmark (What score should represent 75% of the display width), draws the actual bars on the SDL2 canvas.
It draws each rectangle in turn, only drawing the bar name on top of the rectangles when it comes across a new named score.

This allows for certain score labels to represent multiple consecutive bars.

```cpp
template<std::regular_invocable<int, int> CompareFunc>
void draw_rank_markers_scores(
    ox::sdl_instance& win,
    const std::span<const score_data> ranks,
    int total_points,
    int highmark,
    dimensions size,
    CompareFunc comp
)
```
Which, given a list of ranks, the current score, and the same highmark as before, will draw the icon markers representing the various ranks on top of the progress bar.
The current score is used along with the comparison function to determine if the score thresholds for each rank to determine if the current score passes the current rank.
`std::greater_equal<int>` is used as the comparison for simple score requirements.
`std::less_equal<int>` is used for stuff like time based requirements where a stage has to be cleared in less than a certain time limit

```cpp
void draw_score_text(
    ox::sdl_instance& win,
    const std::span<const score_data> ranks,
    dimensions size
)
```
Which, given a list of rank requirements, draws the rank icon along with the score requirement underneath the progress bar.

### The Main Event Loop

The main even loop can be found in [display/display_rank.hpp](https://github.com/AlexOxorn/rank_viewer/blob/master/display/display_rank.hpp)

The main loop is a template function which expects a static class which is used to customize how each game uses the progress bar.
The needed static values for the template are:
- `process_type`: the type of the process class used to read memory
- `display_dimensions`: the dimensions of the progress window
- `score_names`: list of score lables to load as textures
- `render_sleep`: the duration between refreshes
- `level_state`: struct holding data of current level
- `static_calculations`: a struct to hold state data that persists. must include a `level_state` called level
- `read_level_state`: function that reads the which level that is currently loaded
- `read_stage_data`: function to read the new level data when the level changes
- `get_rank_data`: function to read the rank requirements
- `load_rank_text`: loads the textures for the score values as text
- `draw_state`: calls the draw function from `rankX.cpp` to draw level data
- `draw_data`: call the draw function to draw dynamic data every `render_sleep`

The general flow of the main loop goes like

```cpp
template<typename game>
void display_ranksX(int pid) {
    CreateSDLWindowInstance()
    GetScoreNamesAndLoadTextures()
    LoadRankImages()

    // Event Loop:
    while(!quit) {
        PollSDLEvent()
        BreakIfQuitEvent()

        DrawPreviousFrame()
        ClearRenderer()

        GetCurrentLevel()
        if(LevelHasChanged()) {
            ReadNewLevelData()
        }

        DrawLevelData()
        DrawProgressBarData()
        SleepUntilNextFrame()
    }
}
```

## Defining The Game

Within the `games` folder, it defines all of the data need to read and parse the data within the game memory. This itself is defined in multiple parts.

### The Structs

Within [structs.hpp](https://github.com/AlexOxorn/rank_viewer/blob/master/games/sonic_colors_wii/include/sonic_colors/structs.hpp), all game structs would be defined. In the case of Sonic Colours, only on struct really matters as it holds all of the desired data.

```cpp
struct stage_data_struct {
    char stageName[16];  // Internal name for the stage
    char stageData1[16];
    char stageData2[16];
    u8 unknow48[16];
    float startX;       // Starting coordinates for the level
    float startY;
    float startZ;
    float startTheta;
    bool is2D;          // Wether to start the level in 2D mode
    u8 unknown81[2];
    u8 LoadingScreen;   // Which Loading Screen to use
    u8 unknown84[3];
    u8 start_action;    // How should a level start
    float start_speed;  // The starting speed for a level
    u8 unknown92[80];
    char background_music[0x20];  // Internal Name for the music to play
    i32 rank_requirements[4];     // Array of 4 ints representing the S, A, B, and C Requirements
    i32 time_bonus_base;          // The starting value for the time bonus
    i32 time_bonus_penalty;       // The amound the time bonus decreases per second
    i32 no_miss_bonus[5];         // The score bonuse you obtain for dying as few times as possible
    char result_background[0x20]; // The background shown at the end of a level

    void endian_swap() {  // Method called when the dolphin process reader tries to swap the endian
        ox::bswap(&startX);
        ox::bswap(&startY);
        ox::bswap(&startZ);
        ox::bswap(&startTheta);
        ox::bswap(&time_bonus_base);
        ox::bswap(&time_bonus_penalty);
        for(auto & i : rank_requirements)
            ox::bswap(&i);
        for(auto & i : no_miss_bonus)
            ox::bswap(&i);
    }
};
```

The `endian_swap` method is required for the `abstract_process` class to be able to swap the endian of non scalar types. In this case, it is used to byte swap just the relevant values

### The Variables

Within [variables.hpp](https://github.com/AlexOxorn/rank_viewer/blob/master/games/sonic_colors_wii/include/sonic_colors/variables.hpp), we use the helper macros mentioned in the Memory Section to define where to find all the needed data.
Keep in mind that the Wii has two memory locations. The Gamecube's ram address which go from `0x8000'0000` to `0x817F'FFFF` and the Wii exclusive ram addresses which go from `0x9000'0000` to `0x93FF'FFFF`.

```cpp
// The list of 21 different types of score.
// This include values like score from Enemies to score from destroying objects
GAME_ARRAY_VARIABLE(i32, scores, 0x90AB717C, 21)

// The number of times you have died in a level
// Used for the end of life death count bonus
GAME_VARIABLE(i32, death_count, 0x90AB7448)

// The current amount of time you've been in the level
GAME_VARIABLE(float, current_time, 0x90AB7170)

/* 
  The true value for the number of rings you've collected is tied to the
  Sonic object which has a dynamic location in memory and is difficult to track down.
  Luckily there is a read-only mirror used to represnt the ring count in the previous frame and is used by the game for the UI
*/
GAME_VARIABLE(i32, previous_rings, 0x90B25F20)

// The current level being played in the form a zone/act pair
GAME_VARIABLE(i32, current_zone, 0x90AB6F44)
GAME_VARIABLE(i32, current_act, 0x90AB6F48)

// The array holding the stage data for all 75 stages in the game
GAME_ARRAY_VARIABLE(stage_data_struct, stage_data, 0x90BFD860, 75)
```

### Data Extractor

For the data extraction it is important to explain how the scoring systems works.
First is the base score array. As you play a level, these values represent how many points earned for each category of points. In game, the sum of these scores is what is displayed at the top right of the screen. There is nothing particulatly special about these scores, they are applied as is.

For the time bonus, it has two effects. First the bonus itself is calculated based on a base bonus defined per level as well as how quickly that score decreases per second. However once the time bonus becomes 0, that is considered a "Time Over".
At this point, you can not gain any more score, and that includes zeroing out all other end of level bonuses.

The death bonus is a bonus for completing a level dying as few times as possible. Each level defines 5 numbers representing how many points to awards for not dying, dying once, twice, thrice, and four times. Dying five or more times means you do not get any bonus.

The ring bonus awards 1000 points for every ring you bring to the end of a stage. Simple as that.

For the actual extraction functions, there are 3 relevant ones

```cpp
// Given a level (in the form of a zone and act), read from memory and the stage data write to the stage_data reference
int read_stage_data(dolphin_process& process, int zone, int act, stage_data_struct& buffer);

// From the stage data, return the rank requirements in the form of score_data (score and name pair) 
std::array<score_data, 4> interpret_score_rank_data(const stage_data_struct& stage);

// Returns the array of the different types of scores
// For example, 21 entries for the "standard" score categories
// 5 entries for the death bonus segments
// then one entry for the time bonus and ring bonus
std::array<score_data, 28> interpret_score(dolphin_process& process, const stage_data_struct& stage)
```

### Sonic Colours Static Class

The final step of defining a game is the static class within the rank view [header](https://github.com/AlexOxorn/rank_viewer/blob/master/games/sonic_colors_wii/include/sonic_colors/rank_view.hpp) and [source](https://github.com/AlexOxorn/rank_viewer/blob/master/games/sonic_colors_wii/src/rank_view.cpp)

I'm not going to go over the code as there is nothing that really needs to be explained. All of the part of the static class API has been explained previously in this post. The actual implementations are very simple. For example the `draw_data` function is simply draw score bar, then draw rank markers.

The one part I will explain is that withing the namespace used for the Sonic Colors data, inside this same file, we define

```cpp
void display_ranksX(int pid) {
    ::display_ranksX<data>(pid);
}
```

to wrap the `display_ranksX` from the display folder, instantiate the function with the static class, then have the wrapped function be inside the sonic colors namespace.

THIS function is what is used as the entry point for the main loop

## Bringing it all together

Now that we have all of the data defined for Sonic Colors, inside the main function, we can add an argument check for Sonic Colors to get the exact function pointer. Call the function with the process id also from the arguments, then call it day

```cpp
int main(int argc, char** argv) {
    if (argc < 3) {
        exit(-1);
    }

    int pid = std::stoi(argv[2]);
    void(*display_func)(int) = nullptr;

    if ("sa2"sv == argv[1])
        display_func = sa2::display_ranksX;
    // ...
    else if ("colors"sv == argv[1] || "colours"sv == argv[1])
        display_func = gc::sonic_colors::display_ranksX;

    display_func(pid);
}
```
