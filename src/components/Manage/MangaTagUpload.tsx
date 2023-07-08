import { type Dispatch, FC, type SetStateAction } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/Form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";
import { Check, X } from "lucide-react";
import { Input } from "../ui/Input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/Command";
import type { MangaUploadPayload, tagInfoProps } from "@/lib/validators/upload";
import type { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

type Tags = {
  category: string;
  data: {
    id: number;
    name: string;
    description: string;
  }[];
};

interface MangaTagUploadProps {
  tag: Tags[];
  tagSelect: tagInfoProps[];
  form: UseFormReturn<MangaUploadPayload>;
  setTagSelect: Dispatch<SetStateAction<tagInfoProps[]>>;
}

const MangaTagUpload: FC<MangaTagUploadProps> = ({
  form,
  tag,
  tagSelect,
  setTagSelect,
}) => {
  const tagCopy = tag.flatMap((t) => t.data);

  return (
    <FormField
      control={form.control}
      name="tag"
      render={() => (
        <FormItem>
          <FormLabel>Thể loại</FormLabel>
          <FormMessage />
          <Popover>
            <ul className="flex items-center gap-x-2">
              {tagSelect.map((t, i) => (
                <li
                  key={i}
                  className="flex items-center gap-x-1 rounded-md bg-zinc-800 p-1"
                >
                  {t.name}
                  <span
                    onClick={() => {
                      const tagValue = [
                        ...tagSelect.filter((ta) => ta.name !== t.name),
                      ];
                      form.setValue("tag", tagValue);
                      setTagSelect(tagValue);
                    }}
                  >
                    <X className="h-5 w-5 cursor-pointer text-red-500" />
                  </span>
                </li>
              ))}
            </ul>
            <PopoverTrigger className="w-full">
              <FormControl>
                <Input placeholder="Thể loại" />
              </FormControl>
            </PopoverTrigger>
            <PopoverContent>
              <Command>
                <CommandInput placeholder="Tìm thể loại" />
                <CommandEmpty>Không tìm thấy</CommandEmpty>
                <CommandList>
                  {tag.length &&
                    tag.map((t, idx) => (
                      <CommandGroup key={`${idx}`} heading={t.category}>
                        {t.data.map((d, i) => (
                          <CommandItem
                            key={`${i}`}
                            title={d.description}
                            className="cursor-pointer"
                            onSelect={(currVal) => {
                              if (
                                !tagSelect.some(
                                  (d) => d.name.toLocaleLowerCase() === currVal
                                )
                              ) {
                                const tagValue = [
                                  ...tagSelect,
                                  ...tagCopy.filter(
                                    (T) => T.name.toLowerCase() === currVal
                                  ),
                                ];
                                form.setValue("tag", tagValue);
                                setTagSelect(tagValue);
                              } else {
                                const tagValue = [
                                  ...tagSelect.filter(
                                    (T) => T.name.toLowerCase() !== currVal
                                  ),
                                ];
                                form.setValue("tag", tagValue);
                                setTagSelect(tagValue);
                              }
                            }}
                          >
                            <div
                              className={cn(
                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                tagSelect.includes(d)
                                  ? "bg-primary text-primary-foreground"
                                  : "opacity-50 [&_svg]:invisible"
                              )}
                            >
                              <Check className="h-4 w-4" />
                            </div>
                            {d.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </FormItem>
      )}
    />
  );
};

export default MangaTagUpload;