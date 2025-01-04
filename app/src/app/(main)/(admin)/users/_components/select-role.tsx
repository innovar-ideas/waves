import React, { useEffect, useState } from "react";
import Select from "react-select";
import { trpc } from "@/app/_providers/trpc-provider";

type TSelectRoles = {
  value: string;
  label: string;
  id: string;
};

const SelectRoles = ({ ...field }) => {
  const [allOptions, setAllOptions] = useState<TSelectRoles[]>([]);
 // Use the query hook without `onSuccess`
 const { data, isLoading, isError } = trpc.getRoles.useQuery();

 // Reactively update the state when data is available
 useEffect(() => {
   if (data) {
     setAllOptions(data); // Update the state with fetched data
   }
 }, [data]);

 if (isLoading) {
   return <div>Loading...</div>;
 }

 if (isError) {
   return <div>Error loading roles.</div>;
 }

  return (
    <Select
      { ...field }
      defaultValue={[]}
      isMulti
      name="roles"
      options={allOptions as never}
      isSearchable
      className=""
      classNamePrefix="roles"
    />
  );
};

export default SelectRoles;
