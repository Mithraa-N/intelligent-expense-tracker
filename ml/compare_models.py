import pandas as pd
import numpy as np
import time
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, classification_report
from sentence_transformers import SentenceTransformer
import joblib
import os

def load_data():
    try:
        df = pd.read_csv("data/cleaned_expenses.csv")
        return df
    except FileNotFoundError:
        print("Cleaned data not found. Please run preprocessing first.")
        return None

def evaluate_model(name, y_test, y_pred, start_time):
    duration = time.time() - start_time
    accuracy = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average='weighted')
    print(f"\n--- {name} Results ---")
    print(f"Accuracy: {accuracy:.4f}")
    print(f"F1-Score: {f1:.4f}")
    print(f"Training/Inference Time: {duration:.2f}s")
    return {"Model": name, "Accuracy": accuracy, "F1-Score": f1, "Time": duration}

def compare_approaches():
    df = load_data()
    if df is None: return

    X = df['description_cleaned'].fillna('')
    y = df['category']

    X_train_text, X_test_text, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    results = []

    # --- 1. Baseline: TF-IDF + Logistic Regression ---
    print("\n[Baseline] Training TF-IDF + Logistic Regression...")
    start = time.time()
    vectorizer = TfidfVectorizer(ngram_range=(1, 2))
    X_train_tfidf = vectorizer.fit_transform(X_train_text)
    X_test_tfidf = vectorizer.transform(X_test_text)
    
    baseline_model = LogisticRegression(max_iter=1000)
    baseline_model.fit(X_train_tfidf, y_train)
    y_pred_baseline = baseline_model.predict(X_test_tfidf)
    results.append(evaluate_model("TF-IDF + LogReg (Baseline)", y_test, y_pred_baseline, start))

    # --- 2. Advanced: Sentence Transformers (MiniLM) + Random Forest ---
    print("\n[Advanced] Loading Sentence Transformer and generating embeddings...")
    start = time.time()
    # Using a small, fast model
    st_model = SentenceTransformer('all-MiniLM-L6-v2')
    
    X_train_embeddings = st_model.encode(X_train_text.tolist())
    X_test_embeddings = st_model.encode(X_test_text.tolist())
    
    print("Training Random Forest on embeddings...")
    advanced_model = RandomForestClassifier(n_estimators=100, random_state=42)
    advanced_model.fit(X_train_embeddings, y_train)
    y_pred_advanced = advanced_model.predict(X_test_embeddings)
    results.append(evaluate_model("Sentence-BERT + Random Forest (Advanced)", y_test, y_pred_advanced, start))

    # --- 3. Comparison Table ---
    comparison_df = pd.DataFrame(results)
    print("\n--- Summary Comparison ---")
    print(comparison_df.to_string(index=False))

    # Save the better model (for this demo, we'll save the advanced one if it's comparable)
    best_model_info = comparison_df.loc[comparison_df['F1-Score'].idxmax()]
    print(f"\nBest model based on F1-Score: {best_model_info['Model']}")
    
    # Save Advanced components
    os.makedirs("ml/advanced", exist_ok=True)
    joblib.dump(advanced_model, "ml/advanced/model_rf_st.pkl")
    # Note: SentenceTransformer doesn't need joblib, it's loaded by name
    print("Advanced model saved to ml/advanced/")

if __name__ == "__main__":
    compare_approaches()
