"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";

import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
} from "@tanstack/react-table";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { z } from "zod";

import { useIsMobile } from "@/hooks/use-mobile";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { Checkbox } from "@/components/ui/checkbox";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Separator } from "@/components/ui/separator";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { HugeiconsIcon } from "@hugeicons/react";

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  CheckmarkCircle01Icon,
  ChartUpIcon,
  DragDropVerticalIcon,
  Loading03Icon,
  MoreVerticalCircle01Icon,
} from "@hugeicons/core-free-icons";

export const schema = z.object({
  id: z.number(),
  assessment: z.string(),
  code: z.string(),
  status: z.string(),
  score: z.number(),
  target: z.number(),
  student: z.string(),
});

const chartData = [
  {
    month: "January",
    desktop: 186,
    mobile: 80,
  },
  {
    month: "February",
    desktop: 305,
    mobile: 200,
  },
  {
    month: "March",
    desktop: 237,
    mobile: 120,
  },
  {
    month: "April",
    desktop: 73,
    mobile: 190,
  },
  {
    month: "May",
    desktop: 209,
    mobile: 130,
  },
  {
    month: "June",
    desktop: 214,
    mobile: 140,
  },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <HugeiconsIcon
        icon={DragDropVerticalIcon}
        strokeWidth={2}
        className="text-muted-foreground size-3"
      />
    </Button>
  );
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },

  {
    id: "select",

    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),

    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </div>
    ),
  },

  {
    accessorKey: "assessment",
    header: "Assessment",

    cell: ({ row }) => <TableCellViewer item={row.original} />,
  },

  {
    accessorKey: "code",
    header: "Course Code",

    cell: ({ row }) => <Badge variant="outline">{row.original.code}</Badge>,
  },

  {
    accessorKey: "status",
    header: "Status",

    cell: ({ row }) => (
      <Badge variant="outline" className="gap-1">
        {row.original.status === "Complete" ? (
          <HugeiconsIcon
            icon={CheckmarkCircle01Icon}
            strokeWidth={2}
            className="fill-green-500"
          />
        ) : (
          <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} />
        )}

        {row.original.status}
      </Badge>
    ),
  },

  {
    accessorKey: "score",

    header: () => <div className="text-right">Score</div>,

    cell: ({ row }) => <div className="text-right">{row.original.score}</div>,
  },

  {
    accessorKey: "target",

    header: () => <div className="text-right">Target</div>,

    cell: ({ row }) => <div className="text-right">{row.original.target}</div>,
  },

  {
    accessorKey: "student",
    header: "Student",

    cell: ({ row }) => <div className="min-w-45">{row.original.student}</div>,
  },

  {
    id: "actions",

    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="ghost" size="icon" className="size-8">
            <HugeiconsIcon icon={MoreVerticalCircle01Icon} strokeWidth={2} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem>Edit</DropdownMenuItem>

          <DropdownMenuItem>View Student</DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      ref={setNodeRef}
      data-dragging={isDragging}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[];
}) {
  const [data, setData] = React.useState(initialData);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data.map(({ id }) => id),
    [data],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id.toString(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);

        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              <SortableContext
                items={dataIds}
                strategy={verticalListSortingStrategy}
              >
                {table.getRowModel().rows.map((row) => (
                  <DraggableRow key={row.id} row={row} />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="w-fit px-0 text-left">
          {item.assessment}
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{item.assessment}</DrawerTitle>

          <DrawerDescription>Student performance overview</DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 overflow-y-auto px-4 pb-4">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} />

                  <XAxis dataKey="month" tickLine={false} axisLine={false} />

                  <ChartTooltip content={<ChartTooltipContent />} />

                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="var(--color-mobile)"
                    stroke="var(--color-mobile)"
                  />

                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    stroke="var(--color-desktop)"
                  />
                </AreaChart>
              </ChartContainer>

              <Separator />

              <div className="flex items-center gap-2 text-sm font-medium">
                Trending up by 5.2%
                <HugeiconsIcon
                  icon={ChartUpIcon}
                  strokeWidth={2}
                  className="size-4"
                />
              </div>
            </>
          )}

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Assessment</Label>

              <Input defaultValue={item.assessment} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Course Code</Label>

                <Input defaultValue={item.code} />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>

                <Select defaultValue={item.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Complete">Complete</SelectItem>

                      <SelectItem value="Awaiting submission">
                        Awaiting submission
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Score</Label>

                <Input defaultValue={item.score} />
              </div>

              <div className="space-y-2">
                <Label>Target</Label>

                <Input defaultValue={item.target} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Student</Label>

              <Input defaultValue={item.student} />
            </div>
          </div>
        </div>

        <DrawerFooter>
          <Button>Save Changes</Button>

          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
