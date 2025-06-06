


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."delete_lead_on_medico_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  DELETE FROM lead
  WHERE email = NEW.email;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."delete_lead_on_medico_insert"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."comprovante_especialidade" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "medico_id" "uuid",
    "arquivo" "text"
);


ALTER TABLE "public"."comprovante_especialidade" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comprovante_formacao_outros" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "medico_id" "uuid",
    "arquivo" "text"
);


ALTER TABLE "public"."comprovante_formacao_outros" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comprovante_subespecialidade" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "medico_id" "uuid",
    "arquivo" "text"
);


ALTER TABLE "public"."comprovante_subespecialidade" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."convenio" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "nome" "text" NOT NULL
);


ALTER TABLE "public"."convenio" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."diploma" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "imagem" "text"
);


ALTER TABLE "public"."diploma" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."especialidade" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "nome" "text" NOT NULL,
    "tipo" character(1),
    CONSTRAINT "especialidade_tipo_check" CHECK (("tipo" = ANY (ARRAY['D'::"bpchar", 'E'::"bpchar"])))
);


ALTER TABLE "public"."especialidade" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."faculdade" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "nome" "text" NOT NULL
);


ALTER TABLE "public"."faculdade" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."formacao_outros" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "medico_id" "uuid",
    "nome" "text",
    "show_profile" boolean DEFAULT true,
    "aprovado" boolean DEFAULT true
);


ALTER TABLE "public"."formacao_outros" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."instituicao_residencia" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "nome" "text" NOT NULL
);


ALTER TABLE "public"."instituicao_residencia" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lead" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "email" "text" NOT NULL,
    "step" "text"
);


ALTER TABLE "public"."lead" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."localizacao" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "medico_id" "uuid",
    "nome_endereco" "text",
    "cep" "text",
    "logradouro" "text",
    "numero" "text",
    "complemento" "text",
    "bairro" "text",
    "cidade" "text",
    "estado" "text",
    "telefone" "text",
    "latitude" numeric(9,6),
    "longitude" numeric(9,6)
);


ALTER TABLE "public"."localizacao" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."medico" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "nome" "text" NOT NULL,
    "crm" "text" NOT NULL,
    "foto" "text",
    "rqe" "text",
    "new_rqe" "text",
    "faculdade_id" "uuid",
    "faculdade_outro" "text",
    "diploma" "text",
    "convenio_outro" "text",
    "forma_contato" "text",
    "contato" "text",
    "website" "text",
    "facebook" "text",
    "instagram" "text",
    "tiktok" "text",
    "linkedin" "text",
    "twitter" "text",
    "moderador" boolean DEFAULT false,
    "aprovado" boolean DEFAULT false,
    "descricao" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "email" "text",
    "usuario" "text",
    "teleconsulta" boolean
);


ALTER TABLE "public"."medico" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."medico_convenios" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "medico_id" "uuid",
    "convenio_id" "uuid"
);


ALTER TABLE "public"."medico_convenios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."medico_especialidade_residencia" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "medico_id" "uuid",
    "especialidade_id" "uuid",
    "instituicao_residencia_id" "uuid",
    "instituicao_residencia_outra" "text",
    "show_profile" boolean DEFAULT true,
    "aprovado" boolean DEFAULT true
);


ALTER TABLE "public"."medico_especialidade_residencia" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."medico_estatistica" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "medico_id" "uuid",
    "buscas" integer DEFAULT 0,
    "profile_hits" integer DEFAULT 0,
    "agendar_hits" integer DEFAULT 0,
    "compartilhar_hits" integer DEFAULT 0
);


ALTER TABLE "public"."medico_estatistica" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."medico_subespecialidade_residencia" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "medico_id" "uuid",
    "subespecialidade_nome" "text",
    "instituicao_residencia_id" "uuid",
    "instituicao_residencia_outra" "text",
    "aprovado" boolean
);


ALTER TABLE "public"."medico_subespecialidade_residencia" OWNER TO "postgres";


ALTER TABLE ONLY "public"."comprovante_especialidade"
    ADD CONSTRAINT "comprovante_especialidade_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comprovante_formacao_outros"
    ADD CONSTRAINT "comprovante_formacao_outros_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comprovante_subespecialidade"
    ADD CONSTRAINT "comprovante_subespecialidade_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."convenio"
    ADD CONSTRAINT "convenio_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."diploma"
    ADD CONSTRAINT "diploma_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."especialidade"
    ADD CONSTRAINT "especialidade_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."faculdade"
    ADD CONSTRAINT "faculdade_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."formacao_outros"
    ADD CONSTRAINT "formacao_outros_medico_id_nome_key" UNIQUE ("medico_id", "nome");



ALTER TABLE ONLY "public"."formacao_outros"
    ADD CONSTRAINT "formacao_outros_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."instituicao_residencia"
    ADD CONSTRAINT "instituicao_residencia_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lead"
    ADD CONSTRAINT "lead_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."lead"
    ADD CONSTRAINT "lead_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."localizacao"
    ADD CONSTRAINT "localizacao_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."medico_convenios"
    ADD CONSTRAINT "medico_convenios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."medico"
    ADD CONSTRAINT "medico_crm_key" UNIQUE ("crm");



ALTER TABLE ONLY "public"."medico"
    ADD CONSTRAINT "medico_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."medico_especialidade_residencia"
    ADD CONSTRAINT "medico_especialidade_residencia_medico_id_especialidade_id_key" UNIQUE ("medico_id", "especialidade_id");



ALTER TABLE ONLY "public"."medico_especialidade_residencia"
    ADD CONSTRAINT "medico_especialidade_residencia_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."medico_estatistica"
    ADD CONSTRAINT "medico_estatistica_medico_id_key" UNIQUE ("medico_id");



ALTER TABLE ONLY "public"."medico_estatistica"
    ADD CONSTRAINT "medico_estatistica_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."medico"
    ADD CONSTRAINT "medico_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."medico_subespecialidade_residencia"
    ADD CONSTRAINT "medico_subespecialidade_residencia_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."medico"
    ADD CONSTRAINT "medico_usuario_key" UNIQUE ("usuario");



CREATE OR REPLACE TRIGGER "trg_delete_lead_on_medico_insert" AFTER INSERT ON "public"."medico" FOR EACH ROW EXECUTE FUNCTION "public"."delete_lead_on_medico_insert"();



ALTER TABLE ONLY "public"."comprovante_especialidade"
    ADD CONSTRAINT "comprovante_especialidade_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "public"."medico"("id");



ALTER TABLE ONLY "public"."comprovante_formacao_outros"
    ADD CONSTRAINT "comprovante_formacao_outros_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "public"."medico"("id");



ALTER TABLE ONLY "public"."comprovante_subespecialidade"
    ADD CONSTRAINT "comprovante_subespecialidade_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "public"."medico"("id");



ALTER TABLE ONLY "public"."formacao_outros"
    ADD CONSTRAINT "formacao_outros_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "public"."medico"("id");



ALTER TABLE ONLY "public"."localizacao"
    ADD CONSTRAINT "localizacao_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "public"."medico"("id");



ALTER TABLE ONLY "public"."medico_convenios"
    ADD CONSTRAINT "medico_convenios_convenio_id_fkey" FOREIGN KEY ("convenio_id") REFERENCES "public"."convenio"("id");



ALTER TABLE ONLY "public"."medico_convenios"
    ADD CONSTRAINT "medico_convenios_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "public"."medico"("id");



ALTER TABLE ONLY "public"."medico_especialidade_residencia"
    ADD CONSTRAINT "medico_especialidade_residencia_especialidade_id_fkey" FOREIGN KEY ("especialidade_id") REFERENCES "public"."especialidade"("id");



ALTER TABLE ONLY "public"."medico_especialidade_residencia"
    ADD CONSTRAINT "medico_especialidade_residencia_instituicao_residencia_id_fkey" FOREIGN KEY ("instituicao_residencia_id") REFERENCES "public"."instituicao_residencia"("id");



ALTER TABLE ONLY "public"."medico_especialidade_residencia"
    ADD CONSTRAINT "medico_especialidade_residencia_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "public"."medico"("id");



ALTER TABLE ONLY "public"."medico_estatistica"
    ADD CONSTRAINT "medico_estatistica_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "public"."medico"("id");



ALTER TABLE ONLY "public"."medico"
    ADD CONSTRAINT "medico_faculdade_id_fkey" FOREIGN KEY ("faculdade_id") REFERENCES "public"."faculdade"("id");



ALTER TABLE ONLY "public"."medico_subespecialidade_residencia"
    ADD CONSTRAINT "medico_subespecialidade_residenc_instituicao_residencia_id_fkey" FOREIGN KEY ("instituicao_residencia_id") REFERENCES "public"."instituicao_residencia"("id");



ALTER TABLE ONLY "public"."medico_subespecialidade_residencia"
    ADD CONSTRAINT "medico_subespecialidade_residencia_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "public"."medico"("id");



ALTER TABLE ONLY "public"."medico"
    ADD CONSTRAINT "medico_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."delete_lead_on_medico_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_lead_on_medico_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_lead_on_medico_insert"() TO "service_role";



























GRANT ALL ON TABLE "public"."comprovante_especialidade" TO "anon";
GRANT ALL ON TABLE "public"."comprovante_especialidade" TO "authenticated";
GRANT ALL ON TABLE "public"."comprovante_especialidade" TO "service_role";



GRANT ALL ON TABLE "public"."comprovante_formacao_outros" TO "anon";
GRANT ALL ON TABLE "public"."comprovante_formacao_outros" TO "authenticated";
GRANT ALL ON TABLE "public"."comprovante_formacao_outros" TO "service_role";



GRANT ALL ON TABLE "public"."comprovante_subespecialidade" TO "anon";
GRANT ALL ON TABLE "public"."comprovante_subespecialidade" TO "authenticated";
GRANT ALL ON TABLE "public"."comprovante_subespecialidade" TO "service_role";



GRANT ALL ON TABLE "public"."convenio" TO "anon";
GRANT ALL ON TABLE "public"."convenio" TO "authenticated";
GRANT ALL ON TABLE "public"."convenio" TO "service_role";



GRANT ALL ON TABLE "public"."diploma" TO "anon";
GRANT ALL ON TABLE "public"."diploma" TO "authenticated";
GRANT ALL ON TABLE "public"."diploma" TO "service_role";



GRANT ALL ON TABLE "public"."especialidade" TO "anon";
GRANT ALL ON TABLE "public"."especialidade" TO "authenticated";
GRANT ALL ON TABLE "public"."especialidade" TO "service_role";



GRANT ALL ON TABLE "public"."faculdade" TO "anon";
GRANT ALL ON TABLE "public"."faculdade" TO "authenticated";
GRANT ALL ON TABLE "public"."faculdade" TO "service_role";



GRANT ALL ON TABLE "public"."formacao_outros" TO "anon";
GRANT ALL ON TABLE "public"."formacao_outros" TO "authenticated";
GRANT ALL ON TABLE "public"."formacao_outros" TO "service_role";



GRANT ALL ON TABLE "public"."instituicao_residencia" TO "anon";
GRANT ALL ON TABLE "public"."instituicao_residencia" TO "authenticated";
GRANT ALL ON TABLE "public"."instituicao_residencia" TO "service_role";



GRANT ALL ON TABLE "public"."lead" TO "anon";
GRANT ALL ON TABLE "public"."lead" TO "authenticated";
GRANT ALL ON TABLE "public"."lead" TO "service_role";



GRANT ALL ON TABLE "public"."localizacao" TO "anon";
GRANT ALL ON TABLE "public"."localizacao" TO "authenticated";
GRANT ALL ON TABLE "public"."localizacao" TO "service_role";



GRANT ALL ON TABLE "public"."medico" TO "anon";
GRANT ALL ON TABLE "public"."medico" TO "authenticated";
GRANT ALL ON TABLE "public"."medico" TO "service_role";



GRANT ALL ON TABLE "public"."medico_convenios" TO "anon";
GRANT ALL ON TABLE "public"."medico_convenios" TO "authenticated";
GRANT ALL ON TABLE "public"."medico_convenios" TO "service_role";



GRANT ALL ON TABLE "public"."medico_especialidade_residencia" TO "anon";
GRANT ALL ON TABLE "public"."medico_especialidade_residencia" TO "authenticated";
GRANT ALL ON TABLE "public"."medico_especialidade_residencia" TO "service_role";



GRANT ALL ON TABLE "public"."medico_estatistica" TO "anon";
GRANT ALL ON TABLE "public"."medico_estatistica" TO "authenticated";
GRANT ALL ON TABLE "public"."medico_estatistica" TO "service_role";



GRANT ALL ON TABLE "public"."medico_subespecialidade_residencia" TO "anon";
GRANT ALL ON TABLE "public"."medico_subespecialidade_residencia" TO "authenticated";
GRANT ALL ON TABLE "public"."medico_subespecialidade_residencia" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
