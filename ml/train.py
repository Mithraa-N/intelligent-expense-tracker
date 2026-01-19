import pandas as pd
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, confusion_matrix, classification_report
import matplotlib.pyplot as plt
import seaborn as sns

def train_model():
    print("Loading data...")
    try:
        df = pd.read_csv("data/cleaned_expenses.csv")
    except FileNotFoundError:
        print("Cleaned data not found. Please run preprocessing first.")
        return

    # Prepare features and labels
    X = df['description_cleaned'].fillna('')
    y = df['category']

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print(f"Training on {len(X_train)} samples, testing on {len(X_test)} samples.")

    # Vectorize
    vectorizer = TfidfVectorizer(ngram_range=(1, 2))
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    # Train model
    # Use multi_class='multinomial' for better probability estimates in multiclass
    model = LogisticRegression(max_iter=1000, multi_class='multinomial')
    model.fit(X_train_vec, y_train)

    # Predict
    y_pred = model.predict(X_test_vec)
    y_prob = model.predict_proba(X_test_vec)

    # Evaluate
    accuracy = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average='weighted')
    
    print("\n--- Model Evaluation ---")
    print(f"Accuracy: {accuracy:.4f}")
    print(f"F1-Score (Weighted): {f1:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', xticklabels=model.classes_, yticklabels=model.classes_, cmap="Blues")
    plt.title("Confusion Matrix")
    plt.ylabel('Actual')
    plt.xlabel('Predicted')
    
    # Save the confusion matrix plot
    os.makedirs("ml/reports", exist_ok=True)
    plt.savefig("ml/reports/confusion_matrix.png")
    print("\nConfusion matrix saved to ml/reports/confusion_matrix.png")

    # Save the model and vectorizer
    joblib.dump(model, "ml/model.pkl")
    joblib.dump(vectorizer, "ml/vectorizer.pkl")
    print("Model and vectorizer saved to ml/ folder.")

if __name__ == "__main__":
    train_model()
