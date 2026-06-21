import { useState, useRef, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import type { UserDTO } from "@shared/types/api";
import { UserAvatar } from "@shared/components/UserAvatar";
import { truncateAddress } from "@shared/lib/format";
import { cn } from "@shared/lib/cn";

interface HolderSearchDropdownProps {
  value: string;
  onChange: (userId: string) => void;
  error?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
  onSearch: (query: string) => Promise<UserDTO[]>;
}

export function HolderSearchDropdown({
  value,
  onChange,
  error,
  searchPlaceholder = "Search...",
  noResultsText = "No results",
  onSearch,
}: HolderSearchDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const selectedUser = results.find((u) => u.id === value) ?? null;

  const handleSearch = useCallback(
    (q: string) => {
      setQuery(q);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!q) {
        setResults([]);
        return;
      }
      setLoading(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const data = await onSearch(q);
          setResults(data);
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    [onSearch],
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center rounded-xl border px-4 py-3 text-left shadow-sm transition-all",
          "bg-gray-50 text-sm",
          error
            ? "border-error"
            : "border-gray-200 focus:border-transparent focus:ring-2 focus:ring-gold focus:bg-white",
        )}
      >
        {selectedUser ? (
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <UserAvatar user={selectedUser} size="md" className="shrink-0" />
            <div className="min-w-0 text-left flex-1">
              <div className="font-bold text-navy truncate">{selectedUser.name}</div>
              <div className="text-xs text-gray-500 truncate">{selectedUser.number}</div>
              <div className="text-xs text-gray-500 truncate">{selectedUser.email}</div>
              <div className="text-xs text-gray-400 truncate">{selectedUser.phone_number}</div>
              <div className="font-mono text-xs text-gray-400 truncate">
                {selectedUser.wallet_address ? truncateAddress(selectedUser.wallet_address) : ""}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-gray-400 flex-1">{searchPlaceholder}</span>
        )}
        <svg
          className={cn("ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform", open && "rotate-180")}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-100 bg-surface shadow-xl shadow-navy/20 overflow-hidden">
          <div className="flex items-center border-b border-gray-50 px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent text-sm text-navy placeholder-gray-400 outline-none"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {loading && (
              <div className="px-3 py-4 text-center text-sm text-gray-400">Loading...</div>
            )}
            {!loading && results.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-gray-400">{noResultsText}</div>
            )}
            {!loading &&
              results.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left",
                    "hover:bg-navy/5 transition-colors",
                    value === user.id && "bg-navy/5 font-bold",
                  )}
                  onClick={() => {
                    onChange(user.id);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <UserAvatar user={user} size="md" className="shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-navy truncate">
                      {user.name ?? user.email}
                    </div>
                    <div className="text-xs text-gray-500">{user.number}</div>
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                    <div className="text-xs text-gray-400">{user.phone_number}</div>
                    <div className="font-mono text-xs text-gray-400">
                      {user.wallet_address ? truncateAddress(user.wallet_address) : ""}
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
