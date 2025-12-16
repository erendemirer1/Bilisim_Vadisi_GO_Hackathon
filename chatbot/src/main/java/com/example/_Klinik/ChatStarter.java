package com.example._Klinik;


import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class ChatStarter {
    private final ChatModel chatModel;
    private final Map<String, String> qaMap = new HashMap<>();

    public ChatStarter(ChatModel _chatModel){
        chatModel = _chatModel;
        initializeQA();
    }

    private void initializeQA() {
        qaMap.put("Nasıl randevu oluşturabilirim?", "Sayfamızın sağ üst köşesinde bulunan 'Randevu Oluştur' butonu ile istediğiniz bölümden alanında uzman doktorlarımızdan randevu alabilirsiniz.");
        qaMap.put("Randevumu nasıl iptal edebilirim?", "Sayfamızın orta kısmında bulunan 'Randevularınız' kısmından iptal etmek istediğiniz randevuyu seçip iptal edebilirsiniz.");
        qaMap.put("aynı gün randevu alabilir miyim", "Evet, uygun doktor varsa aynı gün randevu verebiliyoruz.");
        qaMap.put("hangi bölümleriniz var", "Dahiliye, Kardiyoloji, Göğüs Hastalıkları, Ortopedi, Fizik Tedavi ve Genel Cerrahi polikliniklerimiz bulunmaktadır.");
        qaMap.put("", "");
    }

    @PostMapping
    String chatBotResponse(@RequestBody Map<String, String> payload){
        String input = payload.get("userInput");

        String contextMessage = buildContextMessage();

        List<Message> messages = new ArrayList<>();
        messages.add(new SystemMessage(contextMessage));
        messages.add(new UserMessage(input));

        String response = chatModel.call(new Prompt(messages))
                .getResult()
                .getOutput()
                .getText();

        return response;
    }

    private String buildContextMessage() {
        StringBuilder context = new StringBuilder();
        context.append("Sen bir klinik'in hem tıp bilgisi olan hemde klinik hakkında insanlara genel bilgi veren asistanısın. ");
        context.append("Aşağıdaki soru-cevap bilgi bankasını kullanarak kullanıcının sorularına cevap ver. ");
        context.append("Eğer soru bilgi bankasında yoksa, kibarca bilmediğini söyle.\n\n");
        context.append("BİLGİ BANKASI:\n");

        for (Map.Entry<String, String> entry : qaMap.entrySet()) {
            context.append("Soru: ").append(entry.getKey()).append("\n");
            context.append("Cevap: ").append(entry.getValue()).append("\n\n");
        }

        context.append("Kullanıcıya Türkçe, kibar ve yardımcı bir şekilde cevap ver.");

        return context.toString();
    }
}
