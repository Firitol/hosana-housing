import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { auditLogs } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
  
export default function AuditLogPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Audit Log</h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead>Description</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                            <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                            <TableCell>{log.user}</TableCell>
                            <TableCell>
                                <Badge variant={log.action === "DELETE" ? "destructive" : log.action === "CREATE" ? "default" : "secondary"}>
                                    {log.action}
                                </Badge>
                            </TableCell>
                            <TableCell>{log.entityType} {log.entityId}</TableCell>
                            <TableCell>{log.description}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
