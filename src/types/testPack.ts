
export interface TestPack {
  id: string;
  nombre_paquete: string;
  itr_asociado: string;
  sistema: string;
  subsistema: string;
  estado: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  test_pack_id: string;
  tag_name: string;
  estado: string;
  fecha_liberacion?: string;
  created_at: string;
  updated_at: string;
}
