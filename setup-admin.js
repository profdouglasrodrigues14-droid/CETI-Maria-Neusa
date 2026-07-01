import { supabase } from "./supabase.js";

/**
 * Script de inicialização do admin
 * Execute este arquivo no console do navegador (F12 > Console)
 * Ou importe em um arquivo HTML de setup
 */

async function setupAdmin() {
  try {
    console.log("🔧 Criando conta admin...");

    // Inserir admin na tabela
    const { data, error } = await supabase
      .from("admins")
      .insert([
        {
          user: "Admin",
          password: "cetimns26"
        }
      ])
      .select();

    if (error) {
      if (error.code === "23505") {
        console.log("⚠️ Admin já existe. Atualizando credenciais...");
        const { error: updateError } = await supabase
          .from("admins")
          .update({ password: "cetimns26" })
          .eq("user", "Admin");
        
        if (updateError) throw updateError;
        console.log("✅ Admin atualizado com sucesso!");
      } else {
        throw error;
      }
    } else {
      console.log("✅ Admin criado com sucesso!", data);
    }

    // Criar configuração inicial da escola
    console.log("📚 Criando configuração da escola...");
    const { error: configError } = await supabase
      .from("school_config")
      .insert([
        {
          history: "CETI Maria Neusa de Sousa - Centro Estadual de Tempo Integral",
          mission: "Formar cidadãos críticos e competentes",
          vision: "Excelência em educação integral",
          values: "Respeito, Responsabilidade, Inovação",
          address: "Francisco Macedo, PI",
          phone: "(86) XXXX-XXXX",
          email: "ceti@seduc.pi.gov.br",
          team: []
        }
      ]);

    if (configError && configError.code !== "23505") {
      console.warn("⚠️ Erro ao criar config:", configError);
    } else {
      console.log("✅ Configuração da escola criada!");
    }

    // Criar algumas turmas iniciais
    console.log("📊 Criando turmas iniciais...");
    const classes = ["1º Ano A", "1º Ano B", "2º Ano A", "2º Ano B", "3º Ano A", "3º Ano B"];
    
    for (const className of classes) {
      const { error: classError } = await supabase
        .from("classes")
        .insert([{ name: className }]);
      
      if (classError && classError.code !== "23505") {
        console.warn(`⚠️ Erro ao criar turma ${className}:`, classError);
      }
    }
    console.log("✅ Turmas criadas!");

    // Criar algumas disciplinas iniciais
    console.log("📖 Criando disciplinas iniciais...");
    const subjects = ["Português", "Matemática", "Ciências", "História", "Geografia", "Educação Física", "Arte", "Inglês"];
    
    for (const subject of subjects) {
      const { error: subjectError } = await supabase
        .from("subjects")
        .insert([{ name: subject }]);
      
      if (subjectError && subjectError.code !== "23505") {
        console.warn(`⚠️ Erro ao criar disciplina ${subject}:`, subjectError);
      }
    }
    console.log("✅ Disciplinas criadas!");

    console.log("\n🎉 SETUP COMPLETO!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Admin criado com sucesso!");
    console.log("🔐 Usuário: Admin");
    console.log("🔑 Senha: cetimns26");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🚀 Você pode agora:");
    console.log("1. Ir para a página de LOGIN");
    console.log("2. Digitar: Admin / cetimns26");
    console.log("3. Começar a cadastrar professores, alunos e notas!");

  } catch (error) {
    console.error("❌ Erro durante o setup:", error);
  }
}

// Executar setup
setupAdmin();
