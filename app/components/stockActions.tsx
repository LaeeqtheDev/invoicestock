import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, MoreHorizontal, Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast"; // Using the custom useToast hook

interface StockActionsProps {
  stockid: string;
  refreshData: () => void; // Add this prop to call parent function
}

export function StockActions({ stockid, refreshData }: StockActionsProps) {
  const { toast } = useToast(); // Destructure the toast function from the hook

  const handleDelete = async () => {
    console.log("stockId:", stockid); // Check if stockId is correct
    if (!stockid) {
      toast({
        title: "Invalid stock ID",
        description: "The stock ID provided is invalid. Please try again.",
        variant: "destructive", // You can adjust the variant for style (optional)
      });
      return;
    }
    try {
      const response = await fetch(`/api/stock/${stockid}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Stock deleted successfully",
          description: "The stock has been deleted from your inventory.",
          variant: "default", // Customize the style for success
        });
        refreshData(); // Refresh the data after deletion
      } else {
        toast({
          title: "Failed to delete stock",
          description:
            "There was an issue deleting the stock. Please try again.",
          variant: "destructive", // Customize the style for error
        });
      }
    } catch (error) {
      console.error("Error deleting stock:", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the stock.",
        variant: "destructive", // Error style
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="secondary">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/stock/edit/${stockid}`}>
            <Pencil className="size-4 mr-2" /> Edit Stock
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <button onClick={handleDelete}>
            <Trash className="size-4 mr-2" /> Delete Stock
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
