import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiShoppingBag,
  FiTruck,
  FiX,
} from "react-icons/fi";
import { DESPACHOS_API, VENTAS_API } from "../../config/api";

const currency = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const today = new Date().toISOString().slice(0, 10);

export const OperationsDashboard = () => {
  const [ventas, setVentas] = useState([]);
  const [despachos, setDespachos] = useState([]);
  const [activeView, setActiveView] = useState("ventas");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [modal, setModal] = useState(null);

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError("");

    try {
      const [ventasResponse, despachosResponse] = await Promise.all([
        axios.get(VENTAS_API),
        axios.get(DESPACHOS_API),
      ]);
      setVentas(ventasResponse.data);
      setDespachos(despachosResponse.data);
      setLastUpdate(new Date());
    } catch (requestError) {
      console.error(requestError);
      setError("No fue posible consultar los servicios. Revisa el estado de los contenedores.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const timer = window.setInterval(() => loadData(false), 30000);
    return () => window.clearInterval(timer);
  }, [loadData]);

  const metrics = useMemo(() => ({
    ventas: ventas.length,
    pendientes: despachos.filter((item) => !item.despachado).length,
    entregados: despachos.filter((item) => item.despachado).length,
    valor: ventas.reduce((total, venta) => total + Number(venta.valorCompra || 0), 0),
  }), [ventas, despachos]);

  const filteredVentas = useMemo(() => {
    const query = search.toLowerCase();
    return ventas.filter((venta) =>
      String(venta.idVenta).includes(query) ||
      venta.direccionCompra.toLowerCase().includes(query)
    );
  }, [search, ventas]);

  const filteredDespachos = useMemo(() => {
    const query = search.toLowerCase();
    return despachos.filter((despacho) =>
      String(despacho.idDespacho).includes(query) ||
      despacho.direccionCompra.toLowerCase().includes(query) ||
      despacho.patenteCamion.toLowerCase().includes(query)
    );
  }, [search, despachos]);

  const createSale = async (event) => {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);

    try {
      await axios.post(VENTAS_API, {
        direccionCompra: form.get("direccionCompra"),
        valorCompra: Number(form.get("valorCompra")),
        fechaCompra: form.get("fechaCompra"),
        despachoGenerado: false,
      });
      setModal(null);
      await loadData(false);
      toast("Venta registrada correctamente");
    } catch (requestError) {
      console.error(requestError);
      toast("No fue posible registrar la venta", "error");
    } finally {
      setSaving(false);
    }
  };

  const createDispatch = async (event) => {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const venta = modal.venta;

    try {
      await axios.post(DESPACHOS_API, {
        fechaDespacho: form.get("fechaDespacho"),
        patenteCamion: form.get("patenteCamion").toUpperCase(),
        intento: 0,
        idCompra: venta.idVenta,
        direccionCompra: venta.direccionCompra,
        valorCompra: venta.valorCompra,
        despachado: false,
      });
      await axios.put(`${VENTAS_API}/${venta.idVenta}`, {
        ...venta,
        despachoGenerado: true,
      });
      setModal(null);
      await loadData(false);
      toast("Despacho generado correctamente");
    } catch (requestError) {
      console.error(requestError);
      toast("No fue posible generar el despacho", "error");
    } finally {
      setSaving(false);
    }
  };

  const updateDispatch = async (despacho, changes, successMessage) => {
    try {
      await axios.put(`${DESPACHOS_API}/${despacho.idDespacho}`, {
        ...despacho,
        ...changes,
      });
      await loadData(false);
      toast(successMessage);
    } catch (requestError) {
      console.error(requestError);
      toast("No fue posible actualizar el despacho", "error");
    }
  };

  const deleteDispatch = async (despacho) => {
    const result = await Swal.fire({
      title: "Eliminar despacho",
      text: `Se eliminara la orden #${despacho.idDespacho}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#c92a2a",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${DESPACHOS_API}/${despacho.idDespacho}`);
      await loadData(false);
      toast("Despacho eliminado");
    } catch (requestError) {
      console.error(requestError);
      toast("No fue posible eliminar el despacho", "error");
    }
  };

  return (
    <div className="operations-app">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-symbol">I</span>
          <div><strong>Innovatech</strong><span>Chile</span></div>
        </div>
        <nav aria-label="Navegacion principal">
          <button className={activeView === "ventas" ? "nav-item active" : "nav-item"} onClick={() => setActiveView("ventas")}>
            <FiShoppingBag /> Ventas
          </button>
          <button className={activeView === "despachos" ? "nav-item active" : "nav-item"} onClick={() => setActiveView("despachos")}>
            <FiTruck /> Despachos
          </button>
        </nav>
        <div className="sidebar-status"><span /> ECS AWS activo</div>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <p className="eyebrow">Centro de operaciones</p>
            <h1>Ventas y despachos</h1>
            <p>Gestion centralizada de ordenes y entregas.</p>
          </div>
          <div className="header-controls">
            <span className="update-time">{lastUpdate ? `Actualizado ${lastUpdate.toLocaleTimeString("es-CL")}` : "Sin actualizar"}</span>
            <button className="icon-control" onClick={() => loadData()} title="Actualizar datos" aria-label="Actualizar datos"><FiRefreshCw /></button>
            <button className="primary-action" onClick={() => setModal({ type: "sale" })}><FiPlus /> Nueva venta</button>
          </div>
        </header>

        <section className="metrics-strip" aria-label="Resumen operacional">
          <Metric icon={<FiShoppingBag />} label="Ventas registradas" value={metrics.ventas} />
          <Metric icon={<FiClock />} label="Despachos pendientes" value={metrics.pendientes} tone="warning" />
          <Metric icon={<FiCheckCircle />} label="Entregas completadas" value={metrics.entregados} tone="success" />
          <Metric icon={<FiActivity />} label="Valor total" value={currency.format(metrics.valor)} />
        </section>

        {error && <div className="error-banner">{error}</div>}

        <section className="data-section">
          <div className="section-toolbar">
            <div>
              <p className="section-kicker">{activeView === "ventas" ? "Ordenes de compra" : "Gestion logistica"}</p>
              <h2>{activeView === "ventas" ? "Ventas" : "Despachos"}</h2>
            </div>
            <label className="search-control">
              <FiSearch />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por ID, direccion o patente" />
            </label>
          </div>

          {loading ? <div className="empty-state">Cargando informacion...</div> : activeView === "ventas" ? (
            <SalesTable ventas={filteredVentas} onDispatch={(venta) => setModal({ type: "dispatch", venta })} />
          ) : (
            <DispatchTable despachos={filteredDespachos} onUpdate={updateDispatch} onDelete={deleteDispatch} />
          )}
        </section>
      </main>

      {modal?.type === "sale" && <SaleModal onClose={() => setModal(null)} onSubmit={createSale} saving={saving} />}
      {modal?.type === "dispatch" && <DispatchModal venta={modal.venta} onClose={() => setModal(null)} onSubmit={createDispatch} saving={saving} />}
    </div>
  );
};

const Metric = ({ icon, label, value, tone = "default" }) => (
  <article className={`metric-item ${tone}`}><span className="metric-icon">{icon}</span><div><span>{label}</span><strong>{value}</strong></div></article>
);

const SalesTable = ({ ventas, onDispatch }) => (
  <div className="table-wrap">
    <table><thead><tr><th>Orden</th><th>Direccion de entrega</th><th>Fecha</th><th>Valor</th><th>Estado</th><th className="actions-column">Accion</th></tr></thead>
      <tbody>{ventas.map((venta) => <tr key={venta.idVenta}><td className="identifier">#{venta.idVenta}</td><td>{venta.direccionCompra}</td><td>{venta.fechaCompra}</td><td>{currency.format(venta.valorCompra)}</td><td><StatusBadge complete={venta.despachoGenerado} completeText="Despacho generado" pendingText="Pendiente" /></td><td className="actions-column"><button className="table-action" disabled={venta.despachoGenerado} onClick={() => onDispatch(venta)}><FiTruck /> {venta.despachoGenerado ? "Generado" : "Generar"}</button></td></tr>)}</tbody>
    </table>{!ventas.length && <div className="empty-state">No se encontraron ventas.</div>}
  </div>
);

const DispatchTable = ({ despachos, onUpdate, onDelete }) => (
  <div className="table-wrap">
    <table><thead><tr><th>Despacho</th><th>Compra</th><th>Direccion</th><th>Patente</th><th>Intentos</th><th>Estado</th><th className="actions-column">Acciones</th></tr></thead>
      <tbody>{despachos.map((item) => <tr key={item.idDespacho}><td className="identifier">#{item.idDespacho}</td><td>#{item.idCompra}</td><td>{item.direccionCompra}</td><td>{item.patenteCamion}</td><td>{item.intento}</td><td><StatusBadge complete={item.despachado} completeText="Entregado" pendingText="En ruta" /></td><td className="actions-column action-group"><button className="small-action" disabled={item.despachado} onClick={() => onUpdate(item, { intento: item.intento + 1 }, "Intento registrado")}>+ Intento</button><button className="small-action success" disabled={item.despachado} onClick={() => onUpdate(item, { despachado: true }, "Despacho completado")}>Entregar</button><button className="remove-action" onClick={() => onDelete(item)} title="Eliminar despacho" aria-label={`Eliminar despacho ${item.idDespacho}`}><FiX /></button></td></tr>)}</tbody>
    </table>{!despachos.length && <div className="empty-state">No se encontraron despachos.</div>}
  </div>
);

const StatusBadge = ({ complete, completeText, pendingText }) => <span className={complete ? "status-badge complete" : "status-badge pending"}><span />{complete ? completeText : pendingText}</span>;

const ModalShell = ({ title, subtitle, onClose, children }) => <div className="modal-backdrop" role="presentation"><section className="modal-panel" role="dialog" aria-modal="true"><header><div><h2>{title}</h2><p>{subtitle}</p></div><button className="modal-close" onClick={onClose} aria-label="Cerrar"><FiX /></button></header>{children}</section></div>;

const SaleModal = ({ onClose, onSubmit, saving }) => <ModalShell title="Nueva venta" subtitle="Registra una nueva orden de compra." onClose={onClose}><form className="operation-form" onSubmit={onSubmit}><label>Direccion de entrega<input name="direccionCompra" required maxLength="200" placeholder="Av. Principal 123" /></label><div className="form-grid"><label>Valor de compra<input name="valorCompra" type="number" min="1" required placeholder="50000" /></label><label>Fecha de compra<input name="fechaCompra" type="date" defaultValue={today} required /></label></div><div className="form-actions"><button type="button" className="secondary-action" onClick={onClose}>Cancelar</button><button className="primary-action" disabled={saving}>{saving ? "Guardando..." : "Registrar venta"}</button></div></form></ModalShell>;

const DispatchModal = ({ venta, onClose, onSubmit, saving }) => <ModalShell title="Generar despacho" subtitle={`Orden de compra #${venta.idVenta}`} onClose={onClose}><form className="operation-form" onSubmit={onSubmit}><div className="order-summary"><span>{venta.direccionCompra}</span><strong>{currency.format(venta.valorCompra)}</strong></div><div className="form-grid"><label>Fecha de despacho<input name="fechaDespacho" type="date" min={today} defaultValue={today} required /></label><label>Patente del camion<input name="patenteCamion" required maxLength="10" placeholder="ABCD12" /></label></div><div className="form-actions"><button type="button" className="secondary-action" onClick={onClose}>Cancelar</button><button className="primary-action" disabled={saving}>{saving ? "Generando..." : "Generar despacho"}</button></div></form></ModalShell>;

const toast = (message, icon = "success") => Swal.fire({ toast: true, position: "top-end", icon, title: message, showConfirmButton: false, timer: 2500, timerProgressBar: true });
