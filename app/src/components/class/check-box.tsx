import React, { InputHTMLAttributes, useEffect, useRef } from "react";

interface IndeterminateCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  indeterminate?: boolean;
}

function IndeterminateCheckbox({ indeterminate, ...rest }: IndeterminateCheckboxProps): JSX.Element {
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof indeterminate === "boolean" && ref.current) {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate, rest.checked]);

  return <input data-cy="checkbox-selector" type='checkbox' ref={ref} {...rest} className='h-4 w-4 rounded-md checked:bg-primaryTheme-500' />;
}

export default IndeterminateCheckbox;
