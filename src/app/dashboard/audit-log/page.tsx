'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
  
export default function AuditLogPage() {
    const firestore = useFirestore();
    const auditLogsQuery = useMemoFirebase(
      () => firestore ? query(collection(firestore, 'auditLogs'), orderBy('timestamp', 'desc'), limit(50)) : null,
      [firestore]
    );
    const { data: auditLogs, isLoading } = useCollection(auditLogsQuery);

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
                    {isLoading && <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>}
                    {!isLoading && auditLogs?.length === 0 && <TableRow><TableCell colSpan={5} className="text-center">No audit logs found.</TableCell></TableRow>}
                    {auditLogs?.map((log) => (
                        <TableRow key={log.id}>
                            <TableCell>{new Date(log.timestamp?.toDate()).toLocaleString()}</TableCell>
                            <TableCell>{log.userEmail || log.userId}</TableCell>
                            <TableCell>
                                <Badge variant={log.action === "DELETE" ? "destructive" : log.action === "CREATE" ? "default" : "secondary"}>
                                    {log.action}
                                </Badge>
                            </TableCell>
                            <TableCell>{log.tableName} {log.recordId}</TableCell>
                            <TableCell>{log.description}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

    