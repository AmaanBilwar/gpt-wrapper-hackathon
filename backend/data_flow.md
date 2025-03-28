# architecture / data flow

1. user adds a new task via frontend form
2. frontend sends task data + user Id to backend
3. backend retreives:
    - user preferences from database
        - [] need to create quiz for this first. s
    - current calendar data from calendar api 
    - historical feedback data
4. backend contructs a GPT prompt combining all contextual data
5. GPT returns scheduling suggestions with reasoning
6. backend processes suggestions into a structured format
7. frontend displays suggestions to user with visualization
8. user accepts/modifies/rejects suggestions
9. feedback is stored to improve future suggestions