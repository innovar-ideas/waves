"use client";

import { Badge } from "@/components/ui/badge";
import { Command, CommandItem, CommandEmpty, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Command as CommandPrimitive } from "cmdk";
import { X as RemoveIcon, Check } from "lucide-react";
import React, { KeyboardEvent, createContext, forwardRef, useCallback, useContext, useState } from "react";
import { FormControl } from "./form";

type MultiSelectorProps = {
  values: string[];
  onValuesChange: (value: string[]) => void;
  loop?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  dataCyItem?: string;
} & React.ComponentPropsWithoutRef<typeof CommandPrimitive>;

interface MultiSelectContextProps {
  value: string[];
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (value: boolean) => void;
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  dataCyItem?: string;
  options?: { label: string; value: string }[];
}

const MultiSelectContext = createContext<MultiSelectContextProps | null>(null);

const useMultiSelect = () => {
  const context = useContext(MultiSelectContext);

  if (!context) {
    throw new Error("useMultiSelect must be used within MultiSelectProvider");
  }

  return context;
};

const MultiSelector = ({
  values: value,
  onValuesChange: onValueChange,
  loop = false,
  className,
  children,
  dir,
  placeholder,
  options = [],
  dataCyItem = "multi-selector",
  ...props
}: MultiSelectorProps) => {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const onValueChangeHandler = useCallback(
    (val: string) => {
      if (value.includes(val)) {
        onValueChange(value.filter((item) => item !== val));
      } else {
        onValueChange([...value, val]);
      }
    },
    [value, onValueChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const moveNext = () => {
        const nextIndex = activeIndex + 1;

        setActiveIndex(nextIndex > value.length - 1 ? (loop ? 0 : -1) : nextIndex);
      };

      const movePrev = () => {
        const prevIndex = activeIndex - 1;

        setActiveIndex(prevIndex < 0 ? value.length - 1 : prevIndex);
      };

      switch (e.key) {
        case "Backspace":
        case "Delete":
          if (inputValue.length === 0 && value.length > 0) {
            if (activeIndex !== -1 && activeIndex < value.length) {
              onValueChange(value.filter((item) => item !== value[activeIndex]));
              const newIndex = activeIndex - 1 < 0 ? 0 : activeIndex - 1;

              setActiveIndex(newIndex);
            } else {
              onValueChange(value.filter((item) => item !== value[value.length - 1]));
            }
          }

          break;
        case "Enter":
          setOpen(true);
          break;
        case "Escape":
          if (activeIndex !== -1) {
            setActiveIndex(-1);
          } else {
            setOpen(false);
          }

          break;
        case "ArrowRight":
          if (dir === "rtl") {
            movePrev();
          } else if (activeIndex !== -1 || loop) {
            moveNext();
          }

          break;
        case "ArrowLeft":
          if (dir === "rtl") {
            if (activeIndex !== -1 || loop) moveNext();
          } else {
            movePrev();
          }

          break;
      }
    },
    [value, inputValue, activeIndex, loop, dir, onValueChange]
  );

  return (
    <MultiSelectContext.Provider
      value={{
        value,
        onValueChange: onValueChangeHandler,
        open,
        setOpen,
        inputValue,
        setInputValue,
        activeIndex,
        setActiveIndex,
        options,
      }}
    >
      <Command
        onKeyDown={handleKeyDown}
        className={cn("flex flex-col space-y-2 overflow-visible bg-transparent", className)}
        dir={dir}
        {...props}
      >
        {children}
        <FormControl>
          <MultiSelectorTrigger data-cy="multi-select-trigger">
            <MultiSelectorInput placeholder={placeholder || "Select Multiple Options"} />
          </MultiSelectorTrigger>
        </FormControl>
        {options.length > 0 ? (
          <MultiSelectorContent>
            <MultiSelectorList>
              {options.map((option) => (
                <MultiSelectorItem data-cy={dataCyItem} key={option.value} value={option.value}>
                  {option.label}
                </MultiSelectorItem>
              ))}
            </MultiSelectorList>
          </MultiSelectorContent>
        ) : (
          <MultiSelectorContent>
            No values to display
            {options.map((m) => m.label)}
          </MultiSelectorContent>
        )}
      </Command>
    </MultiSelectContext.Provider>
  );
};

const MultiSelectorTrigger = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { value, onValueChange, activeIndex, options } = useMultiSelect();

    const mousePreventDefault = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    return (
      <div
        ref={ref}
        className={cn("flex flex-wrap gap-1 rounded-lg border border-muted bg-background p-1 py-2", className)}
        {...props}
      >
        {options
          ?.filter((o) => value?.includes(o.value))
          .map((item, index) => (
            <Badge
              key={item.value}
              className={cn(
                "flex items-center gap-1 rounded-xl px-1",
                activeIndex === index && "ring-2 ring-muted-foreground"
              )}
              variant={"secondary"}
            >
              <span className='text-xs'>{item.label}</span>
              <button
                aria-label={`Remove ${item.label} option`}
                aria-roledescription='button to remove option'
                type='button'
                onMouseDown={mousePreventDefault}
                onClick={() => onValueChange(item.value)}
              >
                <span className='sr-only'>Remove {item.label} option</span>
                <RemoveIcon className='h-4 w-4 hover:stroke-destructive' />
              </button>
            </Badge>
          ))}
        {children}
      </div>
    );
  }
);

MultiSelectorTrigger.displayName = "MultiSelectorTrigger";

const MultiSelectorInput = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => {
  const { setOpen, inputValue, setInputValue, activeIndex, setActiveIndex } = useMultiSelect();

  return (
    <CommandPrimitive.Input
      {...props}
      ref={ref}
      value={inputValue}
      onValueChange={activeIndex === -1 ? setInputValue : undefined}
      onBlur={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onClick={() => setActiveIndex(-1)}
      className={cn(
        "ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground",
        className,
        activeIndex !== -1 && "caret-transparent"
      )}
    />
  );
});

MultiSelectorInput.displayName = "MultiSelectorInput";

const MultiSelectorContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ children }, ref) => {
  const { open } = useMultiSelect();

  return (
    <div ref={ref} className='relative'>
      {open && children}
    </div>
  );
});

MultiSelectorContent.displayName = "MultiSelectorContent";

const MultiSelectorList = forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, children }, ref) => {
  return (
    <CommandList
      ref={ref}
      className={cn(
        "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground dark:scrollbar-thumb-muted scrollbar-thumb-rounded-lg absolute top-0 z-10 flex w-full flex-col gap-2 rounded-md border border-muted bg-background p-2 shadow-md transition-colors",
        className
      )}
    >
      {children}
      <CommandEmpty>
        <span className='text-muted-foreground'>No results found</span>
      </CommandEmpty>
    </CommandList>
  );
});

MultiSelectorList.displayName = "MultiSelectorList";

const MultiSelectorItem = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  { value: string } & React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, value, children, ...props }, ref) => {
  const { value: selectedValues, onValueChange, setInputValue } = useMultiSelect();

  const mousePreventDefault = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const isIncluded = selectedValues.includes(value);

  return (
    <CommandItem
      ref={ref}
      {...props}
      onSelect={() => {
        onValueChange(value);
        setInputValue("");
      }}
      className={cn(
        "flex cursor-pointer justify-between rounded-md px-2 py-1 transition-colors",
        className,
        isIncluded && "cursor-default opacity-50",
        props.disabled && "cursor-not-allowed opacity-50"
      )}
      onMouseDown={mousePreventDefault}
    >
      {children}
      {isIncluded && <Check className='h-4 w-4' />}
    </CommandItem>
  );
});

MultiSelectorItem.displayName = "MultiSelectorItem";

export {
  MultiSelector,
  MultiSelectorTrigger,
  MultiSelectorInput,
  MultiSelectorContent,
  MultiSelectorList,
  MultiSelectorItem,
};
