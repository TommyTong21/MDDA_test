# Supabase 核心 Schema 与 RLS 模板

Backend Agent 在设计表结构时，请遵守以下基准规范：

## 1. 默认表结构规范
```sql
-- 开启 uuid-ossp 扩展
create extension if not exists "uuid-ossp";

-- 示例表
create table public.example_table (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null, -- 强制关联用户
  status text check (status in ('pending', 'active', 'archived')) default 'pending'
);

-- 自动更新 updated_at 触发器
create extension if not exists moddatetime schema extensions;
create trigger handle_updated_at before update on public.example_table
  for each row execute procedure moddatetime (updated_at);
```

## 2. 默认 RLS 策略 (Row Level Security)
**所有表默认启用 RLS，拒绝一切访问。然后显式授权。**

```sql
alter table public.example_table enable row level security;

-- 只有数据拥有者可以读取
create policy "Users can view their own data."
  on public.example_table for select
  using ( auth.uid() = user_id );

-- 只有数据拥有者可以插入
create policy "Users can insert their own data."
  on public.example_table for insert
  with check ( auth.uid() = user_id );

-- 只有数据拥有者可以更新
create policy "Users can update their own data."
  on public.example_table for update
  using ( auth.uid() = user_id );

-- 只有数据拥有者可以删除
create policy "Users can delete their own data."
  on public.example_table for delete
  using ( auth.uid() = user_id );
```
