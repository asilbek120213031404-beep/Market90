-- ============================================================
-- 04_fix_history_uuid.sql
-- products.id — uuid, lekin 03_improvements.sql ning birinchi versiyasida
-- product_history.product_id bigint qilib yaratilgan edi. Natijada:
--   * tarixni o'qish 400 xato beradi
--   * mahsulot qo'shish/tahrirlash/o'chirish trigger xatosi bilan to'xtaydi
-- Bu skript ustun turini uuid ga o'zgartiradi. Qayta ishga tushirish xavfsiz.
-- ============================================================

do $$
begin
  if (select data_type from information_schema.columns
      where table_schema = 'public' and table_name = 'product_history' and column_name = 'product_id') <> 'uuid' then
    -- Jadval bo'sh: bigint ustunga uuid yozib bo'lmagani uchun hech bir yozuv saqlanmagan
    delete from public.product_history;
    alter table public.product_history
      alter column product_id type uuid using null;
  end if;
end $$;
