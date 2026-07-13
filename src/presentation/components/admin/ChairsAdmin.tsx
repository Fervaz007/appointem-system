"use client";

import { useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/presentation/ui/card";
import { Button } from "@/presentation/ui/button";
import { Input } from "@/presentation/ui/input";
import { Label } from "@/presentation/ui/label";
import { Switch } from "@/presentation/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/presentation/ui/dialog";
import { useChairs } from "@/presentation/hooks/useChairs";
import { Chair } from "@/domain/entities/Chair";
import { slugify } from "@/lib/utils";

type ChairFormState = {
  label: string;
  active: boolean;
};

const EMPTY_FORM: ChairFormState = { label: "", active: true };

export default function ChairsAdmin() {
  const { chairs, loading, createChair, updateChair, deleteChair } = useChairs();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ChairFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (chair: Chair) => {
    setEditingId(chair.id);
    setForm({ label: chair.label, active: chair.active });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateChair(editingId, { label: form.label, active: form.active });
      } else {
        await createChair({ id: slugify(form.label), label: form.label, active: form.active });
      }
      setOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      const friendly = message.includes("duplicate key")
        ? "Ya existe una silla con ese nombre. Usa un nombre distinto."
        : message;
      alert("Error al guardar silla: " + friendly);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (chair: Chair) => {
    if (!confirm(`¿Eliminar la silla "${chair.label}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteChair(chair.id);
    } catch (err) {
      alert("Error al eliminar silla: " + (err instanceof Error ? err.message : "Error desconocido"));
    }
  };

  return (
    <Card className="border-none shadow-2xl shadow-pink-200/20 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
      <CardHeader className="border-b border-pink-50/50 pb-6">
        <CardTitle className="text-pink-700 font-light text-2xl">Sillas</CardTitle>
        <CardDescription>Agrega, edita o desactiva las sillas del salón.</CardDescription>
        <CardAction>
          <Button
            onClick={openCreate}
            className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl"
          >
            + Nueva silla
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="p-6">
        {loading && chairs.length === 0 ? (
          <p className="text-center text-slate-400 py-8">Cargando...</p>
        ) : chairs.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No hay sillas registradas.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chairs.map((chair) => (
                <TableRow key={chair.id}>
                  <TableCell className="font-medium">{chair.label}</TableCell>
                  <TableCell>
                    <span className={chair.active ? "text-green-600" : "text-slate-400"}>
                      {chair.active ? "Activa" : "Inactiva"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(chair)}>
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(chair)}>
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-pink-700 font-light text-xl">
              {editingId ? "Editar silla" : "Nueva silla"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chair-label">Nombre *</Label>
              <Input
                id="chair-label"
                placeholder="ej. Silla 4"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                required
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-pink-100 px-4 py-3">
              <Label htmlFor="chair-active">Silla activa</Label>
              <Switch
                id="chair-active"
                checked={form.active}
                onCheckedChange={(checked) => setForm({ ...form, active: checked })}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving} className="bg-pink-500 hover:bg-pink-600 text-white">
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
