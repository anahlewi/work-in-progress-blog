import * as React from "react";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

type SearchBarProps = {
    query: string;
    setQuery: (term: string) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({ query, setQuery }) => {
    return (
        <div className="mb-5 w-full relative">
            <MagnifyingGlassIcon className="pointer-events-none w-4 h-4 absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
            <input
                type="text"
                placeholder="Search notes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8 pr-3 py-2 w-full text-xs rounded-lg border-none dark:bg-muted-foreground/10 focus:outline-none "
            />
        </div>
    );
};

export default SearchBar;

