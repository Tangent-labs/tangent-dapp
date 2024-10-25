import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CustomSelect() {
  return (
    <Select>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">
          {/* Custom HTML for Option 1 */}
          <div className="flex items-center">
            {/* <img src="/icons/icon1.svg" alt="icon1" className="w-4 h-4 mr-2" /> */}
            <span>Option 1 with Icon</span>
          </div>
        </SelectItem>
        <SelectItem value="option2">
          {/* Custom HTML for Option 2 */}
          <div className="flex items-center">
            {/* <img src="/icons/icon2.svg" alt="icon2" className="w-4 h-4 mr-2" /> */}
            <span>Option 2 with Icon</span>
          </div>
        </SelectItem>
        <SelectItem value="option3">
          {/* Custom HTML for Option 3 */}
          <div className="flex flex-col">
            <strong>Option 3 Title</strong>
            <span className="text-sm text-muted-foreground">Subtitle or additional info</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
