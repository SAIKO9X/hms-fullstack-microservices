import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

interface InfoRow {
  label: string;
  value: React.ReactNode;
}

interface ProfileInfoTableProps {
  title: string;
  data: InfoRow[];
}

export const ProfileInfoTable = ({ title, data }: ProfileInfoTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.label}>
                <TableCell className="font-semibold w-[35%]">
                  {row.label}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {row.value || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
