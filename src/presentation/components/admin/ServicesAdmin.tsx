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
import { useServices } from "@/presentation/hooks/useServices";
import { Service } from "@/domain/entities/Service";
import { slugify } from "@/lib/utils";

type ServiceFormState = {
  name: string;
  duration: string;
  price: string;
  active: boolean;
  depositAmount: string;
};

const EMPTY_FORM: ServiceFormState = { name: "", duration: "", price: "", active: true, depositAmount: "" };

export default function ServicesAdmin() {
  const { services, loading, createService, updateService, deleteService } = useServices();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditingId(service.id);
    setForm({
      name: service.name,
      duration: String(service.duration),
      price: String(service.price),
      active: service.active,
      depositAmount: String(service.depositAmount || 0),
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const duration = parseFloat(form.duration);
      const price = parseFloat(form.price);
      const depositAmount = parseFloat(form.depositAmount || "0");
      if (editingId) {
        await updateService(editingId, { name: form.name, duration, price, active: form.active, depositAmount });
      } else {
        await createService({ id: slugify(form.name), name: form.name, duration, price, active: form.active, depositAmount });
      }
      setOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      const friendly = message.includes("duplicate key")
        ? "Ya existe un servicio con ese nombre. Usa un nombre distinto."
        : message;
      alert("Error al guardar servicio: " + friendly);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (service: Service) => {
    if (!confirm(`¿Eliminar el servicio "${service.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteService(service.id);
    } catch (err) {
      alert("Error al eliminar servicio: " + (err instanceof Error ? err.message : "Error desconocido"));
    }
  };

  return (
    <Card className="border-none shadow-2xl shadow-pink-200/20 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
      <CardHeader className="border-b border-pink-50/50 pb-6">
        <CardTitle className="text-pink-700 font-light text-2xl">Servicios</CardTitle>
        <CardDescription>Agrega, edita o desactiva los servicios que ofrece el salón.</CardDescription>
        <CardAction>
          <Button
            onClick={openCreate}
            className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl"
          >
            + Nuevo servicio
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="p-6">
        {loading && services.length === 0 ? (
          <p className="text-center text-slate-400 py-8">Cargando...</p>
        ) : services.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No hay servicios registrados.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Anticipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.duration}h</TableCell>
                  <TableCell>${service.price.toFixed(2)}</TableCell>
                  <TableCell>${(service.depositAmount || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={service.active ? "text-green-600" : "text-slate-400"}>
                      {service.active ? "Activo" : "Inactivo"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(service)}>
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(service)}>
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
              {editingId ? "Editar servicio" : "Nuevo servicio"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service-name">Nombre *</Label>
              <Input
                id="service-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service-duration">Duración *</Label>
                <Input
                  id="service-duration"
                  type="number"
                  min="1"
                  step="1"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-price">Precio *</Label>
                <Input
                  id="service-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-deposit">Anticipo *</Label>
                <Input
                  id="service-deposit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.depositAmount}
                  onChange={(e) => setForm({ ...form, depositAmount: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-pink-100 px-4 py-3">
              <Label htmlFor="service-active">Servicio activo</Label>
              <Switch
                id="service-active"
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
