import nltk
from transformers import BartTokenizer, BartForConditionalGeneration

nltk.download('punkt')

# Initialize the model and tokenizer
model = BartForConditionalGeneration.from_pretrained('facebook/bart-large-cnn')
tokenizer = BartTokenizer.from_pretrained('facebook/bart-large-cnn')

def query_text(inputs):
    input_ids = tokenizer.encode(inputs["inputs"], return_tensors='pt', max_length=1024, truncation=True)
    summary_ids = model.generate(input_ids, max_length=1024, min_length=200, num_beams=4, length_penalty=2.0, early_stopping=True)
    return [tokenizer.decode(g, skip_special_tokens=True, clean_up_tokenization_spaces=False) for g in summary_ids]


def summarize_text(input_text, gist_length=100, full_summary_length=400, heading_length=50):
    sentences = nltk.tokenize.sent_tokenize(input_text)
    max_token_length = tokenizer.model_max_length
    chunks = [input_text[i:i+max_token_length] for i in range(0, len(input_text), max_token_length)]

    final_output = [query_text({"inputs": chunk}) for chunk in chunks]

    summary_texts = []
    for sublist in final_output:
        for item in sublist:
            if isinstance(item, dict) and "summary_text" in item:
                summary_texts.append(item["summary_text"])

    full_summary = " ".join(summary_texts)[:full_summary_length]
    heading = " ".join(summary_texts)[:heading_length]

    if full_summary.strip():
        return {
            "gist": sentences[0][:gist_length],
            "full_summary": full_summary,
            "heading": heading
        }
    else:
        return {
            "gist": "No summary available",
            "full_summary": "No summary available",
            "heading": "No summary available"
        }

# Example usage
input_text = """
Fast asleep, Kristof dreams. It is dark. Out of the darkness, a man, wearing a two-piece suit, joins him. Are you ready Kristof? He asks.
For what?
I’m your guide.
Don’t I know you? Kristof asks. 
Perhaps. Time to go. 
Where?
To places you’ve not seen.

Where are we? Kristof asks.
A bedroom in a care home.
Can the man in the wheelchair see us?
No.
Why is he sobbing?
Alwyn’s been broken by care less ness. Once he had a carer who came to his small bungalow each day. This was deemed too expensive. The carer was sacked; he’d learnt Alwyn’s chaotic language, was able to understand him, and interpret on his behalf. Alwyn’s disease means he can’t write and, without comprehensible speech, he’s imprisoned in his abject loneliness in room 79. They call him ‘mutey’; he’s forty-eight years of age; he’s expected to have a long life imprisoned in himself.
Enough, Kristof says.

Not yet, the man says. Meet Cyril and Mags in their bedroom in the Green Pastures retirement home. They believe their only purpose is to die in comfort with as little pain as possible; they had hoped Covid would have ‘seen them off’. 
Who’s that woman who’s just come out of the bathroom? Kristof asks.
Their new carer, Queenie. She believes it’s her duty to try and lift them from their depression through kindness, and her trust in her Jesus. 
Where you from? Cyril demands.
Tooting, Queenie replies.
But you’re black, Mags objects. Where you really from?
Right, Cyril shouts, you can piss off! We never came here to be amongst blacks.
I’m not having no blacks wiping my arse, Mags adds.
I can’t stand much more of this, Kristof whispers.

It’s three in the morning in the area immediately surrounding St Paul’s Cathedral. 
Why are there hundreds of small tents pitched everywhere? Kristof asks.
They’re the homes of rough sleepers. Perhaps they thought they’d be safe being nearer to the house of their God? Can you hear heavy boots thumping on the ground, van doors slamming, sirens blaring and men shouting? 
Yes, It’s the police. What the hell are they doing? Kristof asks.
Evicting the sleepers, destroying their tents and stealing their possessions.
I didn’t know about this.
Suella Braverman opined that the poor living in tents were making a lifestyle choice. The only thing to do was for those who did that should be prosecuted for a criminal offence. As ever, the cops thought they had license to do what they liked – before the law was enacted. 

Why are you wearing my best suit? Kristof asks. 
Ah, now you recognize me? 
Not sure. We’re close aren’t we?
Once. Now we’re estranged. You put your conscience aside.
You’re me as well, Kristof gasps, the truth dawning.
Yes, the part of you that made you human – conscience. 
But I’m not responsible for the things you’ve just shown me.
Ignorance and laziness are no excuse for careless inhumanity, Conscience says.
"""

result = summarize_text(input_text, full_summary_length=800)

print("Gist:", result["gist"])
print("Full Summary:", result["full_summary"])
print("Heading:", result["heading"])
